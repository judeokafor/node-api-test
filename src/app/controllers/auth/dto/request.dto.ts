import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';

import { UserRoleSchema } from 'src/app/domains/user/users.types';

// Base schema with OpenAPI metadata
const baseAuthSchema = z.object({
  email: extendApi(z.string().email(), {
    description: 'User email address',
    example: 'user@example.com',
  }),
  password: extendApi(z.string().min(4).max(20), {
    description: 'User password must be within (4-20 characters)',
    example: 'password123',
  }),
});

// Sign In Schema

export class SignInRequestDto extends createZodDto(baseAuthSchema) {}

// Sign Up Schema with additional fields
const signUpSchema = baseAuthSchema.extend({
  name: extendApi(z.string(), {
    description: 'User full name',
    example: 'John Doe',
  }),
  role: extendApi(UserRoleSchema, {
    description: 'User role',
    example: 'user',
  }),
});

export class SignUpRequestDto extends createZodDto(signUpSchema) {}
