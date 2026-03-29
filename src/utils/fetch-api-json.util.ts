import type { IApiErrorBody } from "@/src/interfaces/api-error-body.interface";
import { APP_UNKNOWN_ERROR_TYPES_ENUM } from "../features/error-handling/enums/error-codes/app-unknown-error-codes.enum";

interface IFetchApiJsonProps {
  path: string;
  requestInit?: RequestInit;
}

export class FetchApiError extends Error {
  readonly statusCode: number;

  readonly body: IApiErrorBody | null;

  constructor(statusCode: number, body: IApiErrorBody | null) {
    super(`HTTP ${statusCode}`);
    this.name = "FetchApiError";
    this.statusCode = statusCode;
    this.body = body;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const fetchApiJson = async <T>({
  path,
  requestInit,
}: IFetchApiJsonProps): Promise<T> => {
  const response = await fetch(path, {
    credentials: "include",
    ...requestInit,
  });

  if (!response.ok) {
    let parsedBody: IApiErrorBody;

    try {
      parsedBody = (await response.json()) as IApiErrorBody;
    } catch {
      parsedBody = {
        error: "Internal unknown error",
        error_code: APP_UNKNOWN_ERROR_TYPES_ENUM.APP_LEVEL_UNKNOWN_ERROR,
      };
    }

    throw new FetchApiError(response.status, parsedBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
