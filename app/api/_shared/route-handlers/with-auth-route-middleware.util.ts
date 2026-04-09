import { AppLevelUnauthorizedError } from "@/app/api/_shared/features/error-handling/instances/unauthorized-error";
import { sessionRepository } from "@/app/api/_shared/repository/session/session.repository";
import { userRepository } from "@/app/api/_shared/repository/user/user.repository";
import type { TRouteMiddleware } from "@/lib/http/route-middleware.type";
import { SESSION_ID_COOKIE_NAME } from "@/src/constants/session-id-cookie.const";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { NextRequest } from "next/server";

export const withAuthMiddleware: TRouteMiddleware<IRouteHandlerContext> = async (
  request: NextRequest,
  context,
  next,
) => {
  const sessionId = request.cookies.get(SESSION_ID_COOKIE_NAME)?.value;

  if (sessionId === undefined) {
    throw new AppLevelUnauthorizedError();
  }

  const session = await sessionRepository.findSessionUserIdBySessionId({
    sessionId,
  });

  if (session === null) {
    throw new AppLevelUnauthorizedError();
  }

  const user = await userRepository.getAppUserById({
    id: String(session.user),
  });

  if (user === null) {
    throw new AppLevelUnauthorizedError();
  }

  context.session = session;
  context.user = user;

  return next();
};
