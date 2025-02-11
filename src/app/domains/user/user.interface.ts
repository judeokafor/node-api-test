import { IBaseEntity } from '../../../common/database/base.entity';

export interface IUser extends IBaseEntity {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserParams {
  name?: string;
  email?: string;
  role?: UserRole;
}

/**
 * Enum representing possible user roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
