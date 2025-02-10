import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersDomainModule } from '../user/user.domain.module';

@Module({
  imports: [UsersDomainModule],
  providers: [AuthService, JwtService, JwtStrategy],
  exports: [AuthService],
})
export class AuthDomainModule {}
