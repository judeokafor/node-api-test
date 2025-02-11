import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  Body,
  Patch,
  ConflictException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from '../../domains/user/user.service';
import { PaginationQueryDto, UpdateUserDto, UUIDDto } from './dto/request.dto';
import { IUser, UserRole } from '../../domains/user/user.interface';
import { PaginatedResultDto, UserResponseDto } from './dto/response.dto';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { SetMinimumRoles } from '../../../common/decorators/set-roles.decorator';
import { HasMinimumRoleGuard } from '../../../common/guards/has-minimum-role.guard';
import {
  UserNotFoundError,
  SelfDeletionError,
  InsufficientPermissionsError,
  UnauthorizedUpdateError,
  EmailInUseError,
} from '../../domains/user/user.errors';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @ApiOkResponse({
    description: 'User detail fetched successfully',
    type: UserResponseDto,
  })
  async userMe(@GetUser() user: IUser): Promise<UserResponseDto> {
    return new UserResponseDto(user);
  }

  @Get('/')
  @SetMinimumRoles(UserRole.ADMIN)
  @UseGuards(HasMinimumRoleGuard)
  @ApiQuery({
    name: 'Query Params',
    type: PaginationQueryDto,
    required: false,
  })
  @ApiOkResponse({
    description: 'Users fetched successfully',
    type: PaginatedResultDto,
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResultDto<IUser>> {
    const { limit = 10, page = 1 } = query;
    const result = await this.usersService.findAll(limit, page);

    return new PaginatedResultDto(result.data, result.meta);
  }

  @Get('/:id')
  @ApiOkResponse({
    description: 'User fetched successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @SetMinimumRoles(UserRole.ADMIN)
  @UseGuards(HasMinimumRoleGuard)
  async findUserById(@Param() params: UUIDDto): Promise<UserResponseDto> {
    try {
      return await this.usersService.findUserById(params.id);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Delete('/:id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'User deleted successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @SetMinimumRoles(UserRole.ADMIN)
  @UseGuards(HasMinimumRoleGuard)
  async deleteUser(
    @GetUser() user: IUser,
    @Param() params: UUIDDto,
  ): Promise<void> {
    try {
      await this.usersService.deleteUser(user.id, params.id, user.role);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof SelfDeletionError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof InsufficientPermissionsError) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @Patch('/:id')
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Email already in use' })
  async updateUser(
    @GetUser() user: IUser,
    @Param() params: UUIDDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      return await this.usersService.updateUser(
        user.id,
        params.id,
        updateUserDto,
        user.role,
      );
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof UnauthorizedUpdateError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof EmailInUseError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
