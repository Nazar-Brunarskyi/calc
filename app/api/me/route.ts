import type { IAuthenticatedRouteHandlerContext } from "@/app/api/_shared/interfaces/authenticated-route-handler-context.interface";
import { userMapper } from "@/app/api/_shared/mappers/user.mapper";
import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";
import { withAuthMiddleware } from "@/app/api/_shared/route-handlers/with-auth-route-middleware.util";
import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import { IGetMeResponseDto } from "@/src/DTOs/me/get-me-response.dto";

export const GET = createGlobalRouteHandler<IAuthenticatedRouteHandlerContext>(
  async (_request, { user }) =>
    sendResponse<IGetMeResponseDto>({ user: userMapper.toUserMe(user) }),
  { middleware: [withAuthMiddleware] },
);
