import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../app/domains/user/user.interface';

export const ROLES_KEY = 'roles';
export const SetMinimumRoles = (role: UserRole) => SetMetadata(ROLES_KEY, role);
