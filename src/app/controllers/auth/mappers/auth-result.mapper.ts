import { IUser } from 'src/app/domains/user/user.interface';
import { SignUpResponseDto } from '../dto/response.dto';

export class Mapper {
  static toSignUpUserDto(user: IUser, token: string): SignUpResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
