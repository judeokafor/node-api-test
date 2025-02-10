import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { IUser } from './user.interface';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<IUser>,
  ) {}

  async createUser(data: Partial<IUser>): Promise<IUser> {
    const user = this.usersRepository.create(data);
    return await this.usersRepository.save(user);
  }

  async findUserByEmail(email: string): Promise<IUser> {
    return await this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findUserById(userId: string): Promise<IUser> {
    return await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });
  }

  async findAll(
    limit: number,
    page: number,
  ): Promise<{ users: IUser[]; total: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
    });

    return { users: data, total };
  }

  async deleteUser(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
