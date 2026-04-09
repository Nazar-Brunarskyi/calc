import { tryCatchService } from "@/app/api/_shared/services/try-catch/try-catch.service";
import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import { createRouteHandler } from "@/lib/http/create-route-handler.util";

import { googleOAuthService } from "./_service/google-oauth.service";

export const GET = createRouteHandler(async () => {
  const env = tryCatchService.runSync(() =>
    googleOAuthService.readGoogleOauthEnv(),
  );
  if (env === null) {
    return sendResponse(
      { error: "Google OAuth is not configured" },
      { options: { status: 500 } },
    );
  }
  return googleOAuthService.createAuthorizeGoogleRedirect(env);
}, {});
