import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
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

function makeClient(overrides: Partial<CookidooConfig> = {}): {
  client: CookidooHttpClient;
  requests: { method: string; url: string; headers: Record<string, any> }[];
  setHttp: (fn: jest.Mock) => void;
} {
  const configService = {
    getOrThrow: () => ({ ...config, ...overrides }),
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

describe('CookidooHttpClient (session persistence)', () => {
  let cookieFile: string;

  beforeEach(() => {
    cookieFile = join(
      tmpdir(),
      `cookidoo-session-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
    );
  });

  afterEach(async () => {
    await fs.rm(cookieFile, { force: true });
  });

  it('persists the session after login and restores it without logging in again', async () => {
    // First client logs in and writes the cookie file.
    const first = makeClient({ cookieFile });
    first.setHttp(jest.fn(loginChain));
    await first.client.getUserInfo();

    await expect(fs.readFile(cookieFile, 'utf-8')).resolves.toContain(
      '_oauth2_proxy',
    );

    // Second client restores from the file: the API call must succeed without
    // ever hitting the login page.
    const second = makeClient({ cookieFile });
    second.setHttp(
      jest.fn((cfg: any) => {
        if (cfg.method === 'get' && cfg.url.endsWith('/community/profile')) {
          return {
            status: 200,
            headers: {},
            data: { id: 'u1', userInfo: { username: 'chef', picture: null } },
          };
        }
        throw new Error(`Unexpected request: ${cfg.method} ${cfg.url}`);
      }),
    );

    const result = await second.client.getUserInfo();

    expect(result.username).toBe('chef');
    expect(
      second.requests.some((r) => r.url.includes('/profile/es-ES/login')),
    ).toBe(false);
  });
});

describe('CookidooHttpClient (calendar custom recipes)', () => {
  const WEEK_URL = 'https://cookidoo.es/planning/es-ES/api/my-week/2026-06-22';
  const customUrl = (id: string) =>
    `https://cookidoo.es/created-recipes/es-ES/${id}`;

  // The my-week endpoint returns custom recipes only as ids. `c1` is planned
  // twice, `gone` was deleted after planning and `inline` is returned in full.
  const week = {
    myDays: [
      {
        id: '2026-06-22',
        title: 'Monday',
        recipes: [{ id: 'r1', title: 'Soup', totalTime: 1800 }],
        customerRecipeIds: ['c1'],
      },
      {
        id: '2026-06-23',
        title: 'Tuesday',
        recipes: [],
        customerRecipeIds: ['c1', 'gone'],
      },
      {
        id: '2026-06-24',
        title: 'Wednesday',
        recipes: [],
        customerRecipes: [{ id: 'inline', title: 'Inline', totalTime: 600 }],
        customerRecipeIds: ['inline'],
      },
    ],
  };

  function calendarApi(customStatus: (id: string) => number) {
    return jest.fn((cfg: any) => {
      if (cfg.method === 'get' && cfg.url === WEEK_URL) {
        return { status: 200, headers: {}, data: week };
      }
      const match = /\/created-recipes\/es-ES\/(\w+)$/.exec(cfg.url);
      if (cfg.method === 'get' && match) {
        const status = customStatus(match[1]);
        return {
          status,
          headers: {},
          data:
            status === 200
              ? {
                  recipeId: match[1],
                  recipeContent: { name: 'My dish', totalTime: 'PT30M' },
                }
              : '',
        };
      }
      return loginChain(cfg);
    });
  }

  it('leaves custom recipes as ids by default', async () => {
    const { client, requests, setHttp } = makeClient();
    setHttp(calendarApi(() => 200));

    const days = await client.getRecipesInCalendarWeek('2026-06-22');

    expect(days[0].recipes.map((r) => r.id)).toEqual(['r1']);
    expect(days[0].recipes[0].isCustom).toBe(false);
    expect(days[0].customerRecipeIds).toEqual(['c1']);
    expect(days[1].recipes).toEqual([]);
    expect(requests.some((r) => r.url.includes('/created-recipes/'))).toBe(
      false,
    );
  });

  it('resolves each planned custom recipe once and appends it to its days', async () => {
    const { client, requests, setHttp } = makeClient();
    setHttp(calendarApi((id) => (id === 'gone' ? 404 : 200)));

    const days = await client.getRecipesInCalendarWeek('2026-06-22', {
      resolveCustomRecipes: true,
    });

    expect(days[0].recipes.map((r) => r.id)).toEqual(['r1', 'c1']);
    expect(days[0].recipes[1]).toEqual({
      id: 'c1',
      name: 'My dish',
      totalTime: 1800,
      thumbnail: null,
      image: null,
      url: 'https://cookidoo.es/created-recipes/es-ES/c1',
      isCustom: true,
    });
    // The deleted recipe is skipped but stays visible as an id.
    expect(days[1].recipes.map((r) => r.id)).toEqual(['c1']);
    expect(days[1].customerRecipeIds).toEqual(['c1', 'gone']);
    // Already returned inline, so not loaded again.
    expect(days[2].recipes.map((r) => r.id)).toEqual(['inline']);

    const fetched = (id: string) =>
      requests.filter((r) => r.url === customUrl(id)).length;
    expect(fetched('c1')).toBe(1);
    expect(fetched('gone')).toBe(1);
    expect(fetched('inline')).toBe(0);
  });

  it('propagates auth failures while resolving', async () => {
    const { client, setHttp } = makeClient();
    setHttp(calendarApi(() => 401));

    await expect(
      client.getRecipesInCalendarWeek('2026-06-22', {
        resolveCustomRecipes: true,
      }),
    ).rejects.toBeInstanceOf(CookidooAuthException);
  });
});
