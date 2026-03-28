import { createRouteHandler } from "@/lib/http/create-route-handler.util";

import { googleOAuthService } from "./service/google-oauth.service";

export const GET = createRouteHandler(
  async () => googleOAuthService.createAuthorizeRedirectResponse(),
  {},
);
