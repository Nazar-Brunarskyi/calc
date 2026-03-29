import type { NextResponse } from "next/server";

import type { IRedirectResponseCookie } from "@/app/api/_shared/interfaces/redirect-response-cookie.interface";

export interface IApplyCookiesToNextResponseProps<
  TResponse extends NextResponse,
> {
  response: TResponse;
  cookies: IRedirectResponseCookie[];
}

export const applyCookiesToNextResponse = <TResponse extends NextResponse>({
  response,
  cookies,
}: IApplyCookiesToNextResponseProps<TResponse>): TResponse => {
  for (const { name, value, options: cookieOptions } of cookies) {
    response.cookies.set(name, value, cookieOptions);
  }
  return response;
};
