import type { NextRequest } from "next/server";

import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";
import { googleOAuthService } from "@/app/api/auth/google/_service/google-oauth.service";

export const GET = createGlobalRouteHandler(async (request: NextRequest) => {
  return googleOAuthService.handleGoogleOAuthCallback(request);
});
