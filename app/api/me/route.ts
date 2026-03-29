import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";
import { withAuthMiddleware } from "@/app/api/_shared/route-handlers/with-auth-route-middleware.util";
import { userMapper } from "@/app/api/_shared/mappers/user.mapper";
import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import type { IAuthenticatedRouteHandlerContext } from "@/app/api/_shared/interfaces/authenticated-route-handler-context.interface";
import type { IUserMe } from "@/src/interfaces/user-me.interface";

type IMeSuccessBody = {
  user: IUserMe;
};

export const GET = createGlobalRouteHandler<IAuthenticatedRouteHandlerContext>(
  async (_request, { user }) =>
    sendResponse<IMeSuccessBody>({ user: userMapper.toUserMe(user) }),
  { middleware: [withAuthMiddleware] },
);
