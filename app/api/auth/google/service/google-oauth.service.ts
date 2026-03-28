import { randomBytes } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { userRepository } from "@/app/api/_shared/repository/user/user.repository";
import { authService } from "@/app/api/_shared/services/auth/auth.service";
import { tryCatchService } from "@/app/api/_shared/services/try-catch/try-catch.service";
import { readRequiredEnv } from "@/src/utils/read-required-env.util";

/** HttpOnly cookie holding the OAuth `state` CSRF value until callback. */
const GOOGLE_OAUTH_STATE_COOKIE_NAME = "google_oauth_state";

/** How long the OAuth `state` cookie is valid (seconds). */
const GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS = 600;

const GOOGLE_OAUTH_AUTHORIZE_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

const GOOGLE_OAUTH_USERINFO_URL =
  "https://openidconnect.googleapis.com/v1/userinfo";

const GOOGLE_OAUTH_SCOPES = "openid email profile";

interface IGoogleOauthEnv {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface IBuildGoogleAuthorizeUrlProps {
  clientId: string;
  redirectUri: string;
  state: string;
}

interface IExchangeGoogleAuthorizationCodeProps {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}

interface IGoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

interface IGoogleOpenIdUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

interface IFetchGoogleUserInfoProps {
  accessToken: string;
}

/**
 * PRIVATE
 */
const readGoogleOauthEnv = (): IGoogleOauthEnv => ({
  clientId: readRequiredEnv("GOOGLE_CLIENT_ID"),
  clientSecret: readRequiredEnv("GOOGLE_CLIENT_SECRET"),
  redirectUri: readRequiredEnv("GOOGLE_OAUTH_REDIRECT_URI"),
});

/**
 * PRIVATE
 */
const resolveOauthSuccessRedirectPath = (
  envSuccessRedirectPath: string | undefined,
): string => {
  const trimmed = (envSuccessRedirectPath ?? "/").trim() || "/";

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/";
  }
  return trimmed;
};

/**
 * PRIVATE
 */
const buildGoogleAuthorizeUrl = ({
  clientId,
  redirectUri,
  state,
}: IBuildGoogleAuthorizeUrlProps): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_OAUTH_SCOPES,
    state,
  });
  return `${GOOGLE_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
};

/**
 * PRIVATE
 */
const isGoogleTokenResponse = (
  value: unknown,
): value is IGoogleTokenResponse => {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const o = value as Record<string, unknown>;

  return typeof o.access_token === "string";
};

/**
 * PRIVATE
 */
const isGoogleOpenIdUserInfo = (
  value: unknown,
): value is IGoogleOpenIdUserInfo => {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const o = value as Record<string, unknown>;

  return typeof o.sub === "string";
};

/**
 * PRIVATE
 */
const exchangeGoogleAuthorizationCode = async ({
  clientId,
  clientSecret,
  code,
  redirectUri,
}: IExchangeGoogleAuthorizationCodeProps): Promise<IGoogleTokenResponse> => {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const raw: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      `Google token exchange failed: ${response.status} ${JSON.stringify(raw)}`,
    );
  }

  if (!isGoogleTokenResponse(raw)) {
    throw new Error("Google token response had unexpected shape");
  }

  return raw;
};

/**
 * PRIVATE
 */
const fetchGoogleUserInfo = async ({
  accessToken,
}: IFetchGoogleUserInfoProps): Promise<IGoogleOpenIdUserInfo> => {
  const response = await fetch(GOOGLE_OAUTH_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const raw: unknown = await response.json();

  if (!response.ok) {
    throw new Error(
      `Google userinfo failed: ${response.status} ${JSON.stringify(raw)}`,
    );
  }

  if (!isGoogleOpenIdUserInfo(raw)) {
    throw new Error("Google userinfo response had unexpected shape");
  }

  return raw;
};

const createAuthorizeRedirectResponse = (): NextResponse => {
  let env: IGoogleOauthEnv;
  try {
    env = readGoogleOauthEnv();
  } catch {
    return NextResponse.json(
      { error: "Google OAuth is not configured" },
      { status: 500 },
    );
  }

  const state = randomBytes(32).toString("hex");

  const authorizeUrl = buildGoogleAuthorizeUrl({
    clientId: env.clientId,
    redirectUri: env.redirectUri,
    state,
  });

  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS,
    path: "/",
  });

  return response;
};

const handleGoogleOAuthCallback = async (
  request: NextRequest,
): Promise<NextResponse> => {
  const successPath = resolveOauthSuccessRedirectPath(
    process.env.OAUTH_SUCCESS_REDIRECT_PATH,
  );

  const redirect = (query: Record<string, string>) =>
    authService.buildOauthRedirect({
      request,
      path: successPath,
      query,
      stateCookieName: GOOGLE_OAUTH_STATE_COOKIE_NAME,
    });

  const env = tryCatchService.runSync(() => readGoogleOauthEnv());
  if (env === null) {
    return redirect({ error: "oauth_not_configured" });
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get(
    GOOGLE_OAUTH_STATE_COOKIE_NAME,
  )?.value;

  if (
    code === null ||
    code === "" ||
    state === null ||
    state === "" ||
    cookieState === undefined ||
    cookieState !== state
  ) {
    return redirect({ error: "oauth_state_invalid" });
  }

  const tokens = await tryCatchService.runAsync(() =>
    exchangeGoogleAuthorizationCode({
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      code,
      redirectUri: env.redirectUri,
    }),
  );
  if (tokens === null) {
    return redirect({ error: "oauth_token_exchange" });
  }

  const profile = await tryCatchService.runAsync(() =>
    fetchGoogleUserInfo({
      accessToken: tokens.access_token,
    }),
  );

  if (profile === null) {
    return redirect({ error: "oauth_userinfo" });
  }

  if (profile.email === undefined || profile.email.trim() === "") {
    return redirect({ error: "oauth_email_required" });
  }

  try {
    const { userId } = await userRepository.findOrCreateGoogleUser({
      googleSub: profile.sub,
      email: profile.email,
      name: profile.name,
    });

    return redirect({ userId });
  } catch (error: unknown) {
    console.error(error);
    return redirect({ error: "oauth_user_persist" });
  }
};

export const googleOAuthService = {
  createAuthorizeRedirectResponse,
  handleGoogleOAuthCallback,
};
