import { NextResponse } from "next/server";

import { applyCookiesToNextResponse } from "./apply-cookies-to-next-response.util";
import type { IRedirectResponseCookie } from "@/src/interfaces/redirect-response-cookie.interface";

export type { IRedirectResponseCookie };

type TRedirectUrl = Parameters<typeof NextResponse.redirect>[0];

interface IRedirectResponseProps {
  url: TRedirectUrl;
  options?: Parameters<typeof NextResponse.redirect>[1];
  cookies?: IRedirectResponseCookie[];
}

export const redirectResponse = ({
  url,
  options,
  cookies,
}: IRedirectResponseProps): ReturnType<typeof NextResponse.redirect> => {
  const response =
    options === undefined
      ? NextResponse.redirect(url)
      : NextResponse.redirect(url, options);

  if (cookies !== undefined) {
    applyCookiesToNextResponse({ response, cookies });
  }

  return response;
};
