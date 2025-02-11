import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { MainModule } from '../src/main.module';
import { dataSource } from './global-setup';
import { useContainer } from 'class-validator';

export async function testApplication(): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [MainModule],
  })
    .overrideProvider(DataSource)
    .useValue(dataSource)
    .compile();

  const app = module.createNestApplication();

  // Set up global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable DI for class-validator
  useContainer(app.select(MainModule), { fallbackOnErrors: true });

  // Ensure response transformations are applied
  await app.init();

  return app;
}
