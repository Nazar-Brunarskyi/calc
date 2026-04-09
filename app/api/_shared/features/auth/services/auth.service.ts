import { sessionRepository } from "@/app/api/_shared/repository/session/session.repository";
import type { IRedirectResponseCookie } from "@/app/api/_shared/utils/redirect-response.util";
import { redirectResponse } from "@/app/api/_shared/utils/redirect-response.util";
import { SESSION_ID_COOKIE_NAME } from "@/src/constants/session-id-cookie.const";
import type { NextRequest, NextResponse } from "next/server";

export interface IBuildOauthRedirectProps {
  request: NextRequest;
  path: string;
  query: Record<string, string>;
  stateCookieName: string;
  extraCookies?: IRedirectResponseCookie[];
}

export interface ILogoutProps {
  sessionId: string;
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

const buildSessionIdCookieClear = (): IRedirectResponseCookie => ({
  name: SESSION_ID_COOKIE_NAME,
  value: "",
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  },
});

const logout = async ({
  sessionId,
}: ILogoutProps): Promise<IRedirectResponseCookie> => {
  await sessionRepository.deleteBySessionId({ sessionId });
  return buildSessionIdCookieClear();
};

export const authService = {
  buildOauthRedirect,
  buildSessionIdCookieClear,
  logout,
};
