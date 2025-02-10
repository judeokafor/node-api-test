import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
  Paramtype,
} from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

class ZodValidationError extends BadRequestException {
  private zodError: ZodError;

  constructor(zodError: ZodError) {
    const errors = zodError.errors.map((error) => ({
      path: error.path.join('.'),
      message: error.message,
    }));

    super({ message: 'Validation failed', errors });
    this.zodError = zodError;
  }
  getZodError(): ZodError {
    return this.zodError;
  }
}

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);
  constructor(private readonly schema: Partial<Record<Paramtype, ZodSchema>>) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const schema = this.schema[metadata.type];

    if (!schema) {
      this.logger.error('Missing schema for param type: ', {
        schema: this.schema,
        value,
        metadata,
      });

      throw new BadRequestException('Missing schema for param type:');
    }

    const parsed = schema.safeParse(value);

    if (!parsed.success) {
      throw new ZodValidationError(parsed.error);
    }

    return parsed.data;
  }
}
