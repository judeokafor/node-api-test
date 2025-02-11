import { Module } from '@nestjs/common';

import { AuthDomainModule } from './domains/auth/auth.domain.module';
import { AuthController } from './controllers/auth/auth.controller';
import { UsersDomainModule } from './domains/user/user.domain.module';
import { UsersController } from './controllers/users/users.controller';

@Module({
  imports: [AuthDomainModule, UsersDomainModule],
  controllers: [AuthController, UsersController],
})
export class AppModule {}
