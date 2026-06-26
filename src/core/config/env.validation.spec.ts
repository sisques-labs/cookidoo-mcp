import { validateEnv } from './env.validation';

function validEnv(
  overrides: Record<string, string | undefined> = {},
): Record<string, string | undefined> {
  return {
    NODE_ENV: 'development',
    COOKIDOO_EMAIL: 'user@example.com',
    COOKIDOO_PASSWORD: 'secret',
    ...overrides,
  };
}

describe('validateEnv', () => {
  it('accepts a complete environment', () => {
    expect(() => validateEnv(validEnv())).not.toThrow();
  });

  it('accepts optional localization overrides', () => {
    expect(() =>
      validateEnv(
        validEnv({
          COOKIDOO_COUNTRY_CODE: 'es',
          COOKIDOO_LANGUAGE: 'es',
          COOKIDOO_URL: 'https://cookidoo.es/foundation/es',
        }),
      ),
    ).not.toThrow();
  });

  it('rejects a missing email', () => {
    expect(() => validateEnv(validEnv({ COOKIDOO_EMAIL: undefined }))).toThrow(
      /Environment validation failed:[\s\S]*COOKIDOO_EMAIL/,
    );
  });

  it('rejects an invalid email', () => {
    expect(() =>
      validateEnv(validEnv({ COOKIDOO_EMAIL: 'not-an-email' })),
    ).toThrow(/COOKIDOO_EMAIL/);
  });

  it('rejects an empty password', () => {
    expect(() => validateEnv(validEnv({ COOKIDOO_PASSWORD: '' }))).toThrow(
      /COOKIDOO_PASSWORD/,
    );
  });

  it('rejects a non-URL localization url', () => {
    expect(() => validateEnv(validEnv({ COOKIDOO_URL: 'not a url' }))).toThrow(
      /COOKIDOO_URL/,
    );
  });
});
