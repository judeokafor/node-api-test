import { Controller, Post, Body } from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from 'src/app/domains/auth/auth.service';

import { SignInRequestDto, SignUpRequestDto } from './dto/request.dto';
import { SignInResponseDto, SignUpResponseDto } from './dto/response.dto';
import {
  SigninInParams,
  SignUpParams,
} from 'src/app/domains/auth/auth.interface';

@ApiTags('User Authentication')
@Controller('auth')
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
    return this.authService.signUp(body as SignUpParams); // type casting due to issues with @anatine/zod-nestjs mapping all properties to optional
  }

  @Post('/signin')
  @ApiOkResponse({
    type: SignInResponseDto,
    description: 'Signed in successfully',
  })
  @ApiUnauthorizedResponse()
  async signin(@Body() body: SignInRequestDto): Promise<SignInResponseDto> {
    return this.authService.signIn(body as SigninInParams);
  }
}
