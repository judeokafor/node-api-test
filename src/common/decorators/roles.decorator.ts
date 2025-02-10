import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/app/domains/user/users.types';

export const ROLES_KEY = 'roles';
export const Roles = (...role: UserRole[]) => SetMetadata(ROLES_KEY, role);
