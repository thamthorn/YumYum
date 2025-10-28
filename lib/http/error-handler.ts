import { jsonResponse } from "@/lib/http/responses";
import { logger } from "@/utils/logger";
import { AppError, ValidationError } from "@/utils/errors";

type AnyRouteHandler<Args extends unknown[]> = (
  ...args: Args
) => Promise<Response>;

export const toErrorResponse = (error: unknown): Response => {
  if (error instanceof ValidationError) {
    return jsonResponse(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      error.status
    );
  }

  if (error instanceof AppError) {
    return jsonResponse(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      error.status
    );
  }

  logger.error("Unhandled error", error);

  return jsonResponse(
    {
      error: {
        code: "internal_error",
        message: "Something went wrong",
      },
    },
    500
  );
};

export const withErrorHandling =
  <Args extends unknown[]>(handler: AnyRouteHandler<Args>) =>
  async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
