import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { mysqlConfig } from './datasource';

@Module({
  imports: [TypeOrmModule.forRoot(mysqlConfig)],
})
export class DatabaseModule {}
