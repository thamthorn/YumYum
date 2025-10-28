import type { ZodIssue } from "zod";

type ErrorOptions = {
  status?: number;
  code?: string;
  cause?: unknown;
  details?: unknown;
};

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly cause?: unknown;
  public readonly details?: unknown;

  constructor(message: string, options: ErrorOptions = {}) {
    const { status = 500, code = "internal_error", cause, details } = options;
    super(message);
    this.status = status;
    this.code = code;
    this.cause = cause;
    this.details = details;
  }
}

export class AuthError extends AppError {
  constructor(message = "Not authenticated") {
    super(message, { status: 401, code: "auth_required" });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, { status: 403, code: "forbidden" });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, { status: 404, code: "not_found" });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, { status: 409, code: "conflict" });
  }
}

export class ValidationError extends AppError {
  constructor(issues: ZodIssue[]) {
    super("Validation failed", {
      status: 400,
      code: "validation_error",
      details: issues,
    });
  }
}
