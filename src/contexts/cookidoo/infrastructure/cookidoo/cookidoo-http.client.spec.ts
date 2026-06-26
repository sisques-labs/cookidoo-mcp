import { ConfigService } from '@nestjs/config';

import { CookidooConfig } from '@core/config/cookidoo.config';
import { CookidooAuthException } from '../../domain/exceptions/cookidoo.exceptions';
import { CookidooHttpClient } from './cookidoo-http.client';

/* eslint-disable @typescript-eslint/no-explicit-any */

const CIAM_LOGIN =
  'https://ciam.prod.cookidoo.vorwerk-digital.com/login-srv/login';

const config: CookidooConfig = {
  email: 'user@example.com',
  password: 'secret',
  localization: {
    countryCode: 'es',
    language: 'es-ES',
    url: 'https://cookidoo.es/foundation/es-ES',
  },
};

function makeClient(): {
  client: CookidooHttpClient;
  requests: { method: string; url: string; headers: Record<string, any> }[];
  setHttp: (fn: jest.Mock) => void;
} {
  const configService = {
    getOrThrow: () => config,
  } as unknown as ConfigService;

  const client = new CookidooHttpClient(configService);
  const requests: {
    method: string;
    url: string;
    headers: Record<string, any>;
  }[] = [];

  const setHttp = (fn: jest.Mock) => {
    (client as any).http = {
      request: jest.fn(async (cfg: any) => {
        requests.push({
          method: cfg.method,
          url: cfg.url,
          headers: cfg.headers,
        });
        return fn(cfg);
      }),
    };
  };

  return { client, requests, setHttp };
}

/**
 * Simulates the cross-domain OAuth2 redirect chain:
 *   cookidoo.es/login -> ciam(login HTML) -> [POST creds] -> cookidoo.es callback
 * setting the two auth cookies on different hops, then the community profile.
 */
function loginChain(cfg: any) {
  const { method, url } = cfg;

  if (method === 'get' && url.includes('/profile/es-ES/login')) {
    return {
      status: 302,
      headers: {
        location: 'https://ciam.prod.cookidoo.vorwerk-digital.com/login?req=1',
        'set-cookie': ['pre_session=1; Domain=cookidoo.es; Path=/'],
      },
      data: '',
    };
  }
  if (method === 'get' && url.startsWith('https://ciam.')) {
    return {
      status: 200,
      headers: {},
      data: '<form><input name="requestId" value="abc-123-def" /></form>',
    };
  }
  if (method === 'post' && url === CIAM_LOGIN) {
    return {
      status: 302,
      headers: {
        location: 'https://cookidoo.es/callback?code=xyz',
        // A cookie set by the CIAM domain (kept under that domain only).
        'set-cookie': [
          'ciam_session=1; Domain=ciam.prod.cookidoo.vorwerk-digital.com; Path=/',
        ],
      },
      data: '',
    };
  }
  if (method === 'get' && url.startsWith('https://cookidoo.es/callback')) {
    return {
      status: 302,
      headers: {
        location: 'https://cookidoo.es/foundation/es-ES/for-you',
        // The cookidoo.es domain sets the two auth cookies.
        'set-cookie': [
          'v-authenticated=yes; Domain=cookidoo.es; Path=/',
          '_oauth2_proxy=token; Domain=cookidoo.es; Path=/',
        ],
      },
      data: '',
    };
  }
  if (method === 'get' && url.endsWith('/for-you')) {
    return { status: 200, headers: {}, data: '' };
  }
  if (method === 'get' && url.endsWith('/community/profile')) {
    return {
      status: 200,
      headers: {},
      data: { id: 'u1', userInfo: { username: 'chef', picture: null } },
    };
  }
  throw new Error(`Unexpected request: ${method} ${url}`);
}

describe('CookidooHttpClient (auth flow)', () => {
  it('carries OAuth cookies across cross-domain redirects and authenticates the API call', async () => {
    const { client, requests, setHttp } = makeClient();
    setHttp(jest.fn(loginChain));

    const result = await client.getUserInfo();

    expect(result).toEqual({
      id: 'u1',
      username: 'chef',
      description: null,
      picture: null,
    });

    // The community/profile request must carry both auth cookies gathered
    // during the redirect chain, plus the JSON Accept header.
    const apiRequest = requests.find((r) =>
      r.url.endsWith('/community/profile'),
    );
    expect(apiRequest).toBeDefined();
    expect(apiRequest!.headers.Cookie).toContain('_oauth2_proxy=token');
    expect(apiRequest!.headers.Cookie).toContain('v-authenticated=yes');
    expect(apiRequest!.headers.Accept).toBe('application/json');

    // The login page GET must use a browser Accept, never application/json.
    const loginGet = requests.find((r) =>
      r.url.includes('/profile/es-ES/login'),
    );
    expect(loginGet!.headers.Accept).toContain('text/html');
  });

  it('logs in only once for several API calls', async () => {
    const { client, requests, setHttp } = makeClient();
    setHttp(jest.fn(loginChain));

    await client.getUserInfo();
    await client.getUserInfo();

    const loginGets = requests.filter((r) =>
      r.url.includes('/profile/es-ES/login'),
    );
    expect(loginGets).toHaveLength(1);
  });

  it('raises an auth error when the required cookies are not set', async () => {
    const { client, setHttp } = makeClient();
    setHttp(
      jest.fn((cfg: any) => {
        if (cfg.method === 'get' && cfg.url.includes('/profile/es-ES/login')) {
          return {
            status: 200,
            headers: {},
            data: '<input name="requestId" value="abc-123-def" />',
          };
        }
        // POST credentials succeeds but sets no auth cookies.
        return { status: 200, headers: {}, data: '' };
      }),
    );

    await expect(client.getUserInfo()).rejects.toBeInstanceOf(
      CookidooAuthException,
    );
  });
});
