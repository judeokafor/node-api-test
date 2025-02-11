import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/set-roles.decorator';
import { IUser, UserRole } from '../../app/domains/user/user.interface';

@Injectable()
export class HasMinimumRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private readonly roleHierarchy: { [key in UserRole]: number } = {
    [UserRole.ADMIN]: 2,
    [UserRole.USER]: 1,
  };

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: IUser }>();
    const user = request.user;

    const userRoleWeight = this.roleHierarchy[user.role];

    const requiredRoleWeight = this.roleHierarchy[requiredRoles];

    return userRoleWeight >= requiredRoleWeight;
  }
}
