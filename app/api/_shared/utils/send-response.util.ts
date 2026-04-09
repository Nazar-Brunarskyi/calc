import type { IRedirectResponseCookie } from "@/app/api/_shared/interfaces/redirect-response-cookie.interface";
import { NextResponse } from "next/server";
import { applyCookiesToNextResponse } from "./apply-cookies-to-next-response.util";

export interface ISendResponseOptions {
  options?: ResponseInit;
  cookies?: IRedirectResponseCookie[];
}

export const sendResponse = <JsonBody extends object>(
  body: JsonBody,
  options?: ISendResponseOptions,
): NextResponse<JsonBody> => {
  const response = NextResponse.json(body, options?.options ?? undefined);

  if (options?.cookies !== undefined) {
    applyCookiesToNextResponse({ response, cookies: options.cookies });
  }
  return response;
};
