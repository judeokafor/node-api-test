import { IBaseEntity } from 'src/common/database/base.entity';
import { UserRole } from './users.types';

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
