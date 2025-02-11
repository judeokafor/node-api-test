import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './user.service';
import { UserMySQLRepository } from './repositories/user.mysql.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UsersService,
    {
      provide: 'IUserRepository',
      useClass: UserMySQLRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersDomainModule {}
