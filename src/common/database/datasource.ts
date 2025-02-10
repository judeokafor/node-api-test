import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import * as dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

// Base configuration shared between NestJS and TypeORM CLI
export const mysqlConfig: MysqlConnectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  namingStrategy: new SnakeNamingStrategy(),
  entities: isTest ? ['src/**/*.entity.ts'] : ['dist/src/**/*.entity.js'],
  migrations: isTest ? ['src/migrations/*.ts'] : ['dist/src/migrations/*.js'],
  migrationsTableName: 'migrations',
  logging: ['error', 'warn'],
};

// DataSource instance for TypeORM CLI used in package.json
const dataSource = new DataSource(mysqlConfig);
export default dataSource;
