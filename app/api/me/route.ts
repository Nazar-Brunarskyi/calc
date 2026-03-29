import type { IAppUser } from "@/app/api/_shared/interfaces/app-user.interface";
import { userMapper } from "@/app/api/_shared/mappers/user.mapper";
import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";
import { withAuthMiddleware } from "@/app/api/_shared/route-handlers/with-auth-route-middleware.util";
import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import { IGetMeResponseDto } from "@/src/DTOs/me/get-me-response.dto";

export const GET = createGlobalRouteHandler<
  IRouteHandlerContext & { user: IAppUser }
>(
  async (_request, { user }) =>
    sendResponse<IGetMeResponseDto>({ user: userMapper.toUserMe(user) }),
  { middleware: [withAuthMiddleware] },
);
