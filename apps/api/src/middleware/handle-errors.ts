import { HTTPException } from 'hono/http-exception';

import type { Context } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';

export const errorHandler = (err: Error, c: Context): Response => {
  console.error('Error:', err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status as StatusCode
    );
  }

  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
};
