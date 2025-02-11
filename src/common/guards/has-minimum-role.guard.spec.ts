import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HasMinimumRoleGuard } from './has-minimum-role.guard';
import { UserRole } from '../../app/domains/user/user.interface';
import { ROLES_KEY } from '../decorators/set-roles.decorator';

describe('HasMinimumRoleGuard', () => {
  let guard: HasMinimumRoleGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new HasMinimumRoleGuard(reflector);

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            role: UserRole.USER,
          },
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
  });

  it('should allow access when no minimum role is set', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should allow access when user role is higher than required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(UserRole.USER);

    const adminContext = {
      ...mockContext,
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            role: UserRole.ADMIN,
          },
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(adminContext)).toBe(true);
  });

  it('should deny access when user role is lower than required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(UserRole.ADMIN);

    expect(guard.canActivate(mockContext)).toBe(false);
  });

  it('should allow access when user role equals required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(UserRole.USER);

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should use ROLES_KEY for metadata', () => {
    const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');

    guard.canActivate(mockContext);

    expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
  });
});
