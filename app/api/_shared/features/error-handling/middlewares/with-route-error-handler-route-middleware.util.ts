import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { TRouteMiddleware } from "@/lib/http/route-middleware.type";
import { INTERNAL_SERVER_ERROR_CODE } from "@/src/features/error-handling/enums/error-codes";
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
      console.error("AppError:", appFields.message, error);

      return sendResponse(
        jsonErrorBody({
          error: appFields.message,
          error_code: appFields.error_code,
          snackbar: appFields.snackbar,
        }),
        { status: appFields.statusCode },
      );
    }

    if (error instanceof Error) {
      console.error("Error:", error.message, error.stack);

      return sendResponse(
        jsonErrorBody({
          error: INTERNAL_SERVER_ERROR_MESSAGE,
          error_code: INTERNAL_SERVER_ERROR_CODE,
        }),
        { status: 500 },
      );
    }

    console.error("Internal Server Error:", error);

    return sendResponse(
      jsonErrorBody({
        error: INTERNAL_SERVER_ERROR_MESSAGE,
        error_code: INTERNAL_SERVER_ERROR_CODE,
      }),
      { status: 500 },
    );
  }
};
