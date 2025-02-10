import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as argon from 'argon2';

import { UsersService } from '../user/user.service';
import { CreateTokenResponse } from './auth.type';
import { AuthResult, SigninInParams, SignUpParams } from './auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(input: SignUpParams): Promise<AuthResult> {
    const { name, email, password, role } = input;

    await this.checkDuplicateEmail(email);

    const hashedPassword = await argon.hash(password);
    const payload = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    const savedUser = await this.usersService.createUser(payload);

    const { access_token } = await this.createSignInToken(
      savedUser.id,
      savedUser.email,
    );
    return {
      user: savedUser,
      token: access_token,
    };
  }

  async signIn(input: SigninInParams): Promise<AuthResult> {
    const { email, password } = input;

    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials provided');
    }

    const isPasswordMatch = await argon.verify(user?.password, password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials provided');
    }

    const { access_token } = await this.createSignInToken(user.id, user.email);

    return { user, token: access_token };
  }

  async createSignInToken(
    userId: string,
    email: string,
  ): Promise<CreateTokenResponse> {
    const token = this.jwtService.sign(
      {
        userId,
        email,
      },
      {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        secret: this.configService.get<string>('JWT_SECRET'),
      },
    );

    return { access_token: token };
  }

  async checkDuplicateEmail(email: string): Promise<void> {
    const existingClient = await this.usersService.findUserByEmail(email);

    if (existingClient) {
      throw new ConflictException('Email already in use.');
    }
  }
}
