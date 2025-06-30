import { type Request, type Response, type NextFunction } from "express";
import * as z from "zod/v4";

export const zodMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: z.treeifyError(err),
    });
    return;
  } else if (err instanceof Error) {
    const error = err as Error & { statusCode?: number };
    res.status(error.statusCode ?? 400).json({
      message: err.message,
    });
    return;
  }
  res.status(500).json({
    message: "Internal server error",
  });
};
