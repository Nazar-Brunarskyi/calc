import { applyCookiesToNextResponse } from "@/app/api/_shared/utils/apply-cookies-to-next-response.util";
import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { TRouteMiddleware } from "@/lib/http/route-middleware.type";
import { APP_UNKNOWN_ERROR_TYPES_ENUM } from "@/src/features/error-handling/enums/error-codes/app-unknown-error-codes.enum";
import { appErrorResponseService } from "../services/app-error-response.service";
import { jsonErrorBody } from "../utils/json-error-body.util";

const INTERNAL_SERVER_ERROR_MESSAGE = "Internal Server Error";

export const withRouteErrorHandler: TRouteMiddleware<
  IRouteHandlerContext
> = async (_request, _context, next) => {
  try {
    return await next();
  } catch (error) {
    const appFields = appErrorResponseService.getResponseFields(error);

    if (appFields !== null) {
      console.error("SERVER AppError:", appFields.message, error);

      const response = sendResponse(
        jsonErrorBody({
          error: appFields.message,
          error_code: appFields.error_code,
          snackbar: appFields.snackbar,
          error_context: appFields.error_context,
        }),
        { status: appFields.statusCode },
      );

      if (appFields.cookies !== undefined) {
        applyCookiesToNextResponse({
          response,
          cookies: appFields.cookies,
        });
      }

      return response;
    }

    if (error instanceof Error) {
      console.error("SERVER Error:", error.message, error.stack);

      return sendResponse(
        jsonErrorBody({
          error: INTERNAL_SERVER_ERROR_MESSAGE,
          error_code: APP_UNKNOWN_ERROR_TYPES_ENUM.APP_LEVEL_UNKNOWN_ERROR,
        }),
        { status: 500 },
      );
    }

    console.error("SERVER Internal Server Error:", error);

    return sendResponse(
      jsonErrorBody({
        error: INTERNAL_SERVER_ERROR_MESSAGE,
        error_code: APP_UNKNOWN_ERROR_TYPES_ENUM.APP_LEVEL_UNKNOWN_ERROR,
      }),
      { status: 500 },
    );
  }
};
