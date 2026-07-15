import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  app.enableShutdownHooks();

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(
    `Cookidoo MCP server listening on http://localhost:${port}/api/mcp`,
    'Bootstrap',
  );
}
bootstrap().catch((error: unknown) => {
  Logger.error('Failed to start Cookidoo MCP server', error, 'Bootstrap');
  process.exit(1);
});
