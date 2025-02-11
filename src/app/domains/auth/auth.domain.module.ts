import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersDomainModule } from '../user/user.domain.module';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Module({
  imports: [UsersDomainModule],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],

  exports: [AuthService],
})
export class AuthDomainModule {}
