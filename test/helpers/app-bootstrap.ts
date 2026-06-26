import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request, { Agent } from 'supertest';

import { AppModule } from '../../src/app.module';

/** A booted e2e application plus a supertest client and a teardown hook. */
export interface E2EContext {
  app: INestApplication;
  http(): Agent;
  close(): Promise<void>;
}

/**
 * Boots the full Nest application the same way `main.ts` does (global `/api`
 * prefix + validation pipe), backed by the dummy credentials set in
 * `env-setup.ts`. No external services are required — the Cookidoo client logs
 * in lazily, so nothing here triggers a network call.
 */
export async function createE2EApp(): Promise<E2EContext> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();

  return {
    app,
    http: () => request(app.getHttpServer()),
    close: () => app.close(),
  };
}
