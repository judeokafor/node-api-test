import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';

import { UsersRepository } from './user.repository';
import { CreateUserParams, IUser } from './user.interface';
import { UserRole } from './users.types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @Inject(UsersRepository) private readonly usersRepository: UsersRepository,
  ) {}

  async createUser(params: CreateUserParams): Promise<User> {
    return await this.usersRepository.createUser(params);
  }

  async findUserByEmail(email: string): Promise<IUser> {
    return this.usersRepository.findUserByEmail(email);
  }

  async userMe(userId: string): Promise<IUser> {
    return this.usersRepository.findUserById(userId);
  }

  async findAll(
    limit: number,
    page: number,
  ): Promise<{ users: IUser[]; total: number }> {
    return await this.usersRepository.findAll(limit, page);
  }

  async findById(userId: string): Promise<IUser> {
    try {
      const user = await this.usersRepository.findUserById(userId);

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      return user;
    } catch (error) {
      this.logger.error({ stack: error?.stack, message: error?.message });
      throw error;
    }
  }

  async findUserById(userId: string): Promise<IUser> {
    try {
      const user = await this.usersRepository.findUserById(userId);

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return user;
    } catch (error) {
      this.logger.error({ stack: error?.stack, message: error?.message });
      throw error;
    }
  }

  async deleteUser(
    requestingUserId: string,
    targetUserId: string,
    role: UserRole,
  ): Promise<void> {
    const userToDelete = await this.usersRepository.findUserById(targetUserId);

    if (!userToDelete) {
      throw new NotFoundException(`User with ID ${targetUserId} not found`);
    }

    if (requestingUserId === targetUserId) {
      throw new ForbiddenException('You cannot delete yourself');
    }

    if (role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to delete users',
      );
    }

    await this.usersRepository.deleteUser(targetUserId);
  }
}
