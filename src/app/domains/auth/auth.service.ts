import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';

import { UsersService } from '../user/user.service';
import {
  AuthResult,
  JwtPayload,
  SigninInParams,
  SignUpParams,
} from './auth.interface';
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from './auth.errors';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(input: SignUpParams): Promise<AuthResult> {
    const { name, email, password, role } = input;

    const existingClient = await this.usersService.findUserByEmail(email);

    if (existingClient) {
      throw new EmailAlreadyExistsError(email);
    }

    const hashedPassword = await argon.hash(password);
    const payload = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    const savedUser = await this.usersService.createUser(payload);
    const token = this.createAuthToken(savedUser.id, savedUser.email);

    return {
      user: savedUser,
      token,
    };
  }

  async signIn(input: SigninInParams): Promise<AuthResult> {
    const { email, password } = input;

    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordMatch = await argon.verify(user.password, password);

    if (!isPasswordMatch) {
      throw new InvalidCredentialsError();
    }

    const token = this.createAuthToken(user.id, user.email);

    return { user, token };
  }

  private createAuthToken(userId: string, email: string): string {
    const payload: JwtPayload = {
      id: userId,
      email,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES_IN'),
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
    });
  }
}
