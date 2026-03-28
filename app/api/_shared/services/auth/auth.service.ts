import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export interface IClearOAuthStateCookieProps {
  response: NextResponse;
  stateCookieName: string;
}

export interface IBuildOauthRedirectProps {
  request: NextRequest;
  path: string;
  query: Record<string, string>;
  stateCookieName: string;
}

const clearOAuthStateCookie = ({
  response,
  stateCookieName,
}: IClearOAuthStateCookieProps): void => {
  response.cookies.set(stateCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
};

const buildOauthRedirect = ({
  request,
  path,
  query,
  stateCookieName,
}: IBuildOauthRedirectProps): NextResponse => {
  const url = new URL(path, request.url);

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  const response = NextResponse.redirect(url);
  clearOAuthStateCookie({ response, stateCookieName });
  return response;
};

export const authService = {
  clearOAuthStateCookie,
  buildOauthRedirect,
};
