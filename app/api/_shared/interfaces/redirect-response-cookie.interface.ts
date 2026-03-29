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
