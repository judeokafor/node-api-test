import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app/app.module';
import { DataSource } from 'typeorm';
import { databaseContainer } from './global-setup';

export async function testApplication(): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DataSource)
    .useValue(databaseContainer)
    .compile();

  return module.createNestApplication();
}
