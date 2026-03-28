import { redirectResponse } from "@/app/api/_shared/utils/redirect-response.util";
import type { NextRequest, NextResponse } from "next/server";

export interface IBuildOauthRedirectProps {
  request: NextRequest;
  path: string;
  query: Record<string, string>;
  stateCookieName: string;
}

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

  return redirectResponse({
    url,
    cookies: [
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
    ],
  });
};

export const authService = {
  buildOauthRedirect,
};
