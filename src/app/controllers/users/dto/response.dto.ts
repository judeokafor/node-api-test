import { ApiProperty } from '@nestjs/swagger';
import {
  IPaginatedResponse,
  IPaginationMeta,
} from '../../../../common/interface/pagination.interface';
import { IUser, UserRole } from '../../../domains/user/user.interface';

/**
 * DTO for user response
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

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
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

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

  constructor(user: IUser) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

class PaginationMetaDto implements IPaginationMeta {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  itemsPerPage: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage: boolean;
}

/**
 * DTO for paginated response
 */
export class PaginatedResultDto<T> implements IPaginatedResponse<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
    type: UserResponseDto,
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
