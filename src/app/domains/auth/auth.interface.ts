import { IUser } from '../user/user.interface';
import { UserRole } from '../user/users.types';

export interface SigninInParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResult {
  token: string;
  user: IUser;
}
