import { registerAs } from '@nestjs/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing environment variable "${name}"`);
  }
  return value.trim();
}

/**
 * Default localization: Spanish Cookidoo (Spain).
 * Override any field via environment variables.
 */
const DEFAULT_COUNTRY_CODE = 'es';
const DEFAULT_LANGUAGE = 'es-ES';
const DEFAULT_URL = 'https://cookidoo.es/foundation/es-ES';

export interface CookidooLocalization {
  readonly countryCode: string;
  readonly language: string;
  readonly url: string;
}

export interface CookidooConfig {
  readonly email: string;
  readonly password: string;
  readonly localization: CookidooLocalization;
  /**
   * Optional path to a file used to persist the session cookies across
   * restarts. When set, the client restores the session from it on startup and
   * rewrites it after every successful login, avoiding a fresh log-in on each
   * restart. When unset, the session lives only in memory.
   */
  readonly cookieFile?: string;
}

/**
 * Resolves the Cookidoo account + localization from the environment.
 *
 * Credentials are required; localization falls back to the upstream defaults.
 */
export const cookidooConfig = registerAs(
  'cookidoo',
  (): CookidooConfig => ({
    email: requireEnv('COOKIDOO_EMAIL'),
    password: requireEnv('COOKIDOO_PASSWORD'),
    localization: {
      countryCode:
        process.env.COOKIDOO_COUNTRY_CODE?.trim() ?? DEFAULT_COUNTRY_CODE,
      language: process.env.COOKIDOO_LANGUAGE?.trim() ?? DEFAULT_LANGUAGE,
      url: process.env.COOKIDOO_URL?.trim() ?? DEFAULT_URL,
    },
    cookieFile: process.env.COOKIDOO_COOKIE_FILE?.trim() || undefined,
  }),
);
