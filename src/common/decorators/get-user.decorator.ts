import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IUser } from '../../app/domains/user/user.interface';

/**
 * Custom parameter decorator to extract user from request
 * Can be used to get either the whole user object or a specific field
 *
 * @example
 * // Get entire user object
 * @GetUser() user: User
 *
 * @example
 * // Get specific field from user
 * @GetUser('email') userEmail: string
 */
export const GetUser = createParamDecorator(
  (data: keyof IUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: IUser }>();
    const user = request.user;

    // If a specific field is requested and exists on user, return just that field
    if (data && user) {
      return user[data];
    }

    return user;
  },
);
