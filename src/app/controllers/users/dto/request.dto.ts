import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  Min,
  Max,
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../../domains/user/user.interface';

/**
 * DTO for pagination query parameters
 * @class PaginationQueryDto
 */
export class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number (starts from 1)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  page: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be greater than or equal to 1' })
  @Max(100, { message: 'Limit must be less than or equal to 100' })
  limit: number = 10;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
    required: false,
  })
  @IsEnum(UserRole, { message: 'Role must be either admin or user' })
  @IsOptional()
  role?: UserRole;
}

export class UUIDDto {
  @ApiProperty({
    description: 'UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('all', { message: 'Invalid UUID format' })
  id: string;
}
