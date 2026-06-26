import { registerAs } from '@nestjs/config';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing environment variable "${name}"`);
  }
  return value.trim();
}

/**
 * Default localization, matching the upstream `cookidoo-api` defaults
 * (Swiss Cookidoo, German). Override any field via environment variables.
 */
const DEFAULT_COUNTRY_CODE = 'ch';
const DEFAULT_LANGUAGE = 'de-CH';
const DEFAULT_URL = 'https://cookidoo.ch/foundation/de-CH';

export interface CookidooLocalization {
  readonly countryCode: string;
  readonly language: string;
  readonly url: string;
}

export interface CookidooConfig {
  readonly email: string;
  readonly password: string;
  readonly localization: CookidooLocalization;
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
      countryCode: process.env.COOKIDOO_COUNTRY_CODE?.trim() ?? DEFAULT_COUNTRY_CODE,
      language: process.env.COOKIDOO_LANGUAGE?.trim() ?? DEFAULT_LANGUAGE,
      url: process.env.COOKIDOO_URL?.trim() ?? DEFAULT_URL,
    },
  }),
);
