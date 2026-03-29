import { APP_ERROR_CODES_TYPE } from "@/src/features/error-handling/enums/error-codes";
import { FetchApiError } from "@/src/utils/fetch-api-json.util";
import { useCallback } from "react";

type FetchErrorHandler = (error: Error) => void;

export interface IErrorHandlersObj {
  error_code: APP_ERROR_CODES_TYPE;
  handler: FetchErrorHandler;
}

export interface IUseErrorHandlerProps {
  errorHandlers?: IErrorHandlersObj[];
}

export type TAsyncLazyFn<T> = () => Promise<T>;

export type TWrapAsyncWithFetchErrorHandlers = <T>(
  fn: TAsyncLazyFn<T>,
) => TAsyncLazyFn<T | null>;

export interface IUseErrorHandlerReturn {
  wrapFunction: TWrapAsyncWithFetchErrorHandlers;
}

const EMPTY_ERROR_HANDLERS: IErrorHandlersObj[] = [];

export const useErrorHandler = ({
  errorHandlers = EMPTY_ERROR_HANDLERS,
}: IUseErrorHandlerProps = {}): IUseErrorHandlerReturn => {
  const wrapFunction = useCallback<TWrapAsyncWithFetchErrorHandlers>(
    (fn) => async () => {
      try {
        return await fn();
      } catch (error) {
        if (
          error instanceof FetchApiError &&
          error.body?.error_code !== undefined
        ) {
          const handler = errorHandlers.find(
            (h) => h.error_code === error.body?.error_code,
          );

          if (handler !== undefined) {
            handler.handler(error);

            return null;
          }
        }

        throw error;
      }
    },
    [errorHandlers],
  );

  return { wrapFunction };
};
