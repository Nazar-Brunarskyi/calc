import { authService } from "@/app/api/_shared/features/auth/services/auth.service";
import type { IAppUser } from "@/app/api/_shared/interfaces/app-user.interface";
import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";
import { withAuthMiddleware } from "@/app/api/_shared/route-handlers/with-auth-route-middleware.util";
import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { ISessionSchema } from "@/lib/mongodb/schemas/session/session-schema.interface";
import type { IPostLogoutResponseDto } from "@/src/DTOs/auth/post-logout-response.dto";

export const POST = createGlobalRouteHandler<
  IRouteHandlerContext & { user: IAppUser; session: ISessionSchema }
>(
  async (_request, { session }) => {
    const sessionIdCookieClear = await authService.logout({
      sessionId: session.sessionId,
    });

    return sendResponse<IPostLogoutResponseDto>(
      { ok: true },
      { cookies: [sessionIdCookieClear] },
    );
  },
  { middleware: [withAuthMiddleware] },
);
