import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const createPaginationResultSchema = <T extends z.ZodType>(itemSchema: T) => {
  return z.object({
    data: z.array(itemSchema),
    total: z.number(),
  });
};

// Create a class factory function
export const createPaginatedResultDto = <T extends z.ZodType>(
  itemSchema: T,
) => {
  return class PaginatedResultDto extends createZodDto(
    createPaginationResultSchema(itemSchema),
  ) {
    data: z.infer<typeof itemSchema>[];
    total: number;

    constructor(data: z.infer<typeof itemSchema>[], total: number) {
      super();
      this.data = data;
      this.total = total;
    }
  };
};
