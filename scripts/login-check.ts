/**
 * Standalone Cookidoo login diagnostic.
 *
 * Runs only the authentication flow (no MCP layer) and prints the outcome.
 * Reads the same environment variables as the server (COOKIDOO_EMAIL,
 * COOKIDOO_PASSWORD and the optional COOKIDOO_* localization vars).
 *
 * Usage:
 *   COOKIDOO_EMAIL=... COOKIDOO_PASSWORD=... pnpm login:check
 *   # add COOKIDOO_DEBUG=true to print every redirect hop and cookie outcome
 */
import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';

import { cookidooConfig } from '../src/core/config/cookidoo.config';
import { CookidooHttpClient } from '../src/contexts/cookidoo/infrastructure/cookidoo/cookidoo-http.client';

async function main(): Promise<void> {
  // Default the diagnostic to verbose so the redirect/cookie trace is shown.
  process.env.COOKIDOO_DEBUG = process.env.COOKIDOO_DEBUG ?? 'true';

  const config = cookidooConfig();
  const configService = {
    getOrThrow: () => config,
  } as unknown as ConfigService;

  console.log(
    `Logging in as ${config.email} on ${config.localization.url} ...`,
  );

  const client = new CookidooHttpClient(configService);
  try {
    const info = await client.getUserInfo();
    console.log('\nLOGIN OK ✅');
    console.log('User info:', JSON.stringify(info, null, 2));
  } catch (error) {
    console.error('\nLOGIN FAILED ❌');
    console.error((error as Error).message);
    process.exitCode = 1;
  }
}

void main();
