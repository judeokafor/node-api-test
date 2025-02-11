import {
  Controller,
  Post,
  Body,
  ConflictException,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from '../../domains/auth/auth.service';

import { SignInRequestDto, SignUpRequestDto } from './dto/request.dto';
import { SignInResponseDto, SignUpResponseDto } from './dto/response.dto';

import { SetIsPublic } from '../../../common/decorators/set-is-public.decorator';
import { Mapper } from './mappers/auth-result.mapper';
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from '../../domains/auth/auth.errors';

@ApiTags('Authentication')
@Controller('auth')
@SetIsPublic()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @ApiCreatedResponse({
    type: SignUpRequestDto,
    description: 'Sign up successfully',
  })
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  async signup(@Body() body: SignUpRequestDto): Promise<SignUpResponseDto> {
    try {
      const data = await this.authService.signUp(body);
      return Mapper.toAuthUser(data.user, data.token);
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Post('/signin')
  @HttpCode(200)
  @ApiOkResponse({
    type: SignInResponseDto,
    description: 'Signed in successfully',
  })
  @ApiUnauthorizedResponse()
  async signin(@Body() body: SignInRequestDto): Promise<SignInResponseDto> {
    try {
      const data = await this.authService.signIn(body);
      return Mapper.toAuthUser(data.user, data.token);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
