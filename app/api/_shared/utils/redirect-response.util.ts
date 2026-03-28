import { NextResponse } from "next/server";

type TRedirectUrl = Parameters<typeof NextResponse.redirect>[0];

/** Same third argument as `NextResponse.prototype.cookies.set`. */
export interface IRedirectResponseCookie {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date | number;
    httpOnly?: boolean;
    maxAge?: number;
    partitioned?: boolean;
    path?: string;
    priority?: "low" | "medium" | "high";
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
  };
}

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
    for (const { name, value, options: cookieOptions } of cookies) {
      response.cookies.set(name, value, cookieOptions);
    }
  }

  return response;
};
