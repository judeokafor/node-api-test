import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';

import { UserRole } from '../../../domains/user/user.interface';

/**
 * DTO for user sign-in request
 * @class SignInRequestDto
 */
export class SignInRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password (4-20 characters)',
    example: 'password123',
    minLength: 4,
    maxLength: 20,
  })
  @IsString({ message: 'Password must be a string' })
  @Length(4, 20, { message: 'Password must be between 4 and 20 characters' })
  password: string;
}

/**
 * DTO for user sign-up request
 * Extends SignInRequestDto to include additional registration fields
 * @class SignUpRequestDto
 */
export class SignUpRequestDto extends SignInRequestDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({
    description: 'User role',
    example: UserRole.USER,
    enum: UserRole,
  })
  @IsEnum(UserRole, { message: 'Role must be either admin or user' })
  role: UserRole;
}
