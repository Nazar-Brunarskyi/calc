import type { NextRequest } from "next/server";

import { googleOAuthService } from "@/app/api/auth/google/service/google-oauth.service";
import { createGlobalRouteHandler } from "@/src/route-handlers/global-route-handler.util";

export const GET = createGlobalRouteHandler(async (request: NextRequest) => {
  return googleOAuthService.handleGoogleOAuthCallback(request);
});
