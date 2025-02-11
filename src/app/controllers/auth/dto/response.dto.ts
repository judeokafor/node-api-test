import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../domains/user/user.interface';

/**
 * Base response DTO with common properties
 * @class BaseResponseDto
 */
export class BaseResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  token?: string;
}

/**
 * DTO for sign-in response
 * @class SignInResponseDto
 */
export class SignInResponseDto extends BaseResponseDto {}

/**
 * DTO for sign-up response
 * Extends base response with additional user details
 * @class SignUpResponseDto
 */
export class SignUpResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Timestamp when the user was created',
    example: '2024-03-15T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the user was last updated',
    example: '2024-03-15T12:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;
}
