import { Context, Next } from 'hono';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => async (c: Context, next: Next) => {
  try {
    const body = await c.req.json();
    schema.parse(body);
    await next();
  } catch (error) {
    return c.json({ error: 'Validation failed', details: error }, 400);
  }
};
