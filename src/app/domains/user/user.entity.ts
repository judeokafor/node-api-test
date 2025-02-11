import { BaseEntity } from '../../../common/database/base.entity';
import { Entity, Column, Index } from 'typeorm';

import { IUser, UserRole } from './user.interface';

const USER_TABLE_NAME = 'users';

@Entity(USER_TABLE_NAME)
export class User extends BaseEntity implements IUser {
  @Column({ nullable: false })
  name: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: false,
  })
  role: UserRole;
}
