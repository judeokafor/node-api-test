import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export class PaginationQueryDto extends createZodDto(paginationSchema) {}
