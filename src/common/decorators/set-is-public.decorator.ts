import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'IS_PUBLIC_KEY';
/**
 * Decorator to set a route as public
 * @returns
 */
export const SetIsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
