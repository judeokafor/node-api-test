import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../user.entity';
import { CreateUserParams, IUser, UpdateUserParams } from '../user.interface';
import { IUserRepository } from './user.repository.interface';
import { IPaginatedResponse } from '../../../../common/interface/pagination.interface';

/**
 * MySQL implementation of the user repository
 */
@Injectable()
export class UserMySQLRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<IUser>,
  ) {}

  async createUser(data: CreateUserParams): Promise<IUser> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async findUserByEmail(email: string): Promise<IUser | undefined> {
    return this.repository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'name',
        'role',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findUserById(userId: string): Promise<IUser | undefined> {
    return this.repository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt'],
    });
  }

  async findAll(
    limit: number,
    page: number,
  ): Promise<IPaginatedResponse<IUser>> {
    const [users, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
      order: {
        createdAt: 'DESC',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async deleteUser(userId: string): Promise<void> {
    await this.repository.delete(userId);
  }

  async updateUser(userId: string, data: UpdateUserParams): Promise<IUser> {
    await this.repository.update(userId, data);
    return this.findUserById(userId);
  }
}
