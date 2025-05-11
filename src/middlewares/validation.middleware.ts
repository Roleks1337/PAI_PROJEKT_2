import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

export interface ErrorResponse {
  error: string;
  details?: unknown;
  code?: string;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(StatusCodes.BAD_REQUEST).json({
      error: 'Validation failed',
      details: errors.array(),
      code: 'VALIDATION_ERROR'
    } as ErrorResponse);
    return;
  }
  next();
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err.stack);
  
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code
    } as ErrorResponse);
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    code: 'INTERNAL_ERROR'
  } as ErrorResponse);
} 