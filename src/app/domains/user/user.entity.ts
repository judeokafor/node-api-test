import { BaseEntity } from 'src/common/database/base.entity';
import { Entity, Column } from 'typeorm';

import { UserRole } from './users.types';
import { IUser } from './user.interface';

const USER_TABLE_NAME = 'users';

@Entity(USER_TABLE_NAME)
export class User extends BaseEntity implements IUser {
  @Column({ nullable: false })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'user',
  })
  role: UserRole;
}
