import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthDomainModule } from './domains/auth/auth.domain.module';
import { AuthController } from './controllers/auth/auth.controller';
import { UsersDomainModule } from './domains/user/user.domain.module';
import { JwtAuthGuard } from './domains/auth/guards/jwt-auth.guard';
import { RoleGuard } from './domains/auth/guards/role.guard';

@Module({
  imports: [AuthDomainModule, UsersDomainModule],

  controllers: [AuthController],

  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule {}
