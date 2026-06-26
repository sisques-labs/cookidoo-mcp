import { z } from 'zod';

function formatZodIssues(issues: z.ZodIssue[]): string {
  return issues
    .map(
      (issue) =>
        `  - ${issue.path.length > 0 ? issue.path.join('.') : '(root)'}: ${issue.message}`,
    )
    .join('\n');
}

/**
 * Schema for the process environment.
 *
 * Cookidoo credentials are mandatory — the server logs in as a single account
 * configured here. Localization is optional and defaults to `de-CH` / Swiss
 * Cookidoo, mirroring the upstream library defaults.
 */
const baseEnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().int().positive().optional(),

  COOKIDOO_EMAIL: z
    .string()
    .trim()
    .min(1, 'COOKIDOO_EMAIL must not be empty')
    .email('COOKIDOO_EMAIL must be a valid email'),
  COOKIDOO_PASSWORD: z.string().min(1, 'COOKIDOO_PASSWORD must not be empty'),

  COOKIDOO_COUNTRY_CODE: z.string().trim().min(1).optional(),
  COOKIDOO_LANGUAGE: z.string().trim().min(1).optional(),
  COOKIDOO_URL: z.string().trim().url().optional(),

  COOKIDOO_COOKIE_FILE: z.string().trim().min(1).optional(),
});

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = baseEnvSchema.safeParse(config);

  if (!parsed.success) {
    throw new Error(
      `Environment validation failed:\n${formatZodIssues(parsed.error.issues)}`,
    );
  }

  return config;
}
