import { createZodDto } from '@anatine/zod-nestjs';
import { UserRoleSchema } from 'src/app/domains/user/users.types';
import { z } from 'zod';

// Base schema with OpenAPI metadata
const baseSchema = z.object({
  id: z.string(),
  token: z.string().optional(),
});

export class SignInResponseDto extends createZodDto(baseSchema) {}

// Sign Up Schema with additional fields
const signUpSchema = baseSchema.extend({
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: UserRoleSchema,
});

export class SignUpResponseDto extends createZodDto(signUpSchema) {}
