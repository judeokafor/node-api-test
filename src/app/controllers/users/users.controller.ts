import { Controller, Delete, Get, Param, Query, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from 'src/app/domains/user/user.service';
import { PaginationQueryDto } from './dto/request.dto';

@ApiTags('User APIs')
@ApiBearerAuth('defaultBearerAuth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('/me')
  @ApiBearerAuth('defaultBearerAuth')
  @ApiOkResponse({
    description: 'User detail fetched successfully',
  })
  async userMe(@Request() req) {
    return await this.usersService.userMe(req.user.id);
  }

  @Get('/')
  @ApiBearerAuth('defaultBearerAuth')
  @ApiQuery({
    name: 'Query Params',
    type: PaginationQueryDto,
    required: false,
    description: 'Query params to fetch all users',
  })
  @ApiOkResponse({
    description: 'Users fetched successfully',
  })
  async findAll(@Query() query: PaginationQueryDto) {
    const { limit = 10, page = 1 } = query;

    const { users, total } = await this.usersService.findAll(limit, page);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        total_pages: totalPages,
      },
    };
  }

  @Get('/:id')
  @ApiNoContentResponse({ description: 'User fetched successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findUserById(@Param('id') id: string) {
    return await this.usersService.findUserById(id);
  }

  @Delete('/:id')
  @ApiNoContentResponse({ description: 'User deleted successfully' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'User not found' })
  //@TODO: Write GetUser decorator
  async deleteUser(@Request() req, @Param('id') id: string): Promise<void> {
    await this.usersService.deleteUser(req.user.id, id, req.user.role);
  }
}
