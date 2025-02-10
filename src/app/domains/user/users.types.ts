import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'user']);

export type UserRole = z.infer<typeof UserRoleSchema>;
