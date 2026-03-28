import type { IRedirectResponseCookie } from "@/app/api/_shared/utils/redirect-response.util";
import { redirectResponse } from "@/app/api/_shared/utils/redirect-response.util";
import type { NextRequest, NextResponse } from "next/server";

export interface IBuildOauthRedirectProps {
  request: NextRequest;
  path: string;
  query: Record<string, string>;
  stateCookieName: string;
  extraCookies?: IRedirectResponseCookie[];
}

const buildOauthRedirect = ({
  request,
  path,
  query,
  stateCookieName,
  extraCookies,
}: IBuildOauthRedirectProps): NextResponse => {
  const url = new URL(path, request.url);

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  const cookies: IRedirectResponseCookie[] = [
    {
      name: stateCookieName,
      value: "",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      },
    },
  ];

  if (extraCookies !== undefined) {
    cookies.push(...extraCookies);
  }

  return redirectResponse({
    url,
    cookies,
  });
};

export const authService = {
  buildOauthRedirect,
};
