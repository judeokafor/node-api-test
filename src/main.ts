import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { MainModule } from './main.module';
import { setupSwagger } from './swagger.setup';

import * as packageJson from 'package.json';

async function bootstrap() {
  try {
    const app = await NestFactory.create(MainModule);

    const { version } = packageJson;

    const configService = app.get(ConfigService);
    const PORT = configService.get('PORT') || 9999;

    const getVersion = Math.floor(parseInt(version));

    app.setGlobalPrefix(`api/v${getVersion}`);

    setupSwagger(app);

    await app.listen(PORT, () =>
      Logger.log(`Service is running at: http://localhost:${PORT}`),
    );
  } catch (error) {
    Logger.error('Error starting server', error);
    process.exit(1);
  }
}
bootstrap();
