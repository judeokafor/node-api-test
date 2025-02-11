import { IUser, UserRole } from '../user/user.interface';

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

export interface JwtPayload {
  id: string;
  email: string;
}
