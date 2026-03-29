import { sessionRepository } from "@/app/api/_shared/repository/session/session.repository";
import { userRepository } from "@/app/api/_shared/repository/user/user.repository";
import { connectMongoDb } from "@/lib/mongodb/connect-mongodb.util";
import { SESSION_ID_COOKIE_NAME } from "@/src/constants/session-id-cookie.const";
import type { IUserMe } from "@/src/interfaces/user-me.interface";
import { cookies } from "next/headers";
import { cache } from "react";

const loadCurrentUserForPage = async (): Promise<IUserMe | null> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_ID_COOKIE_NAME)?.value;

  if (sessionId === undefined) {
    return null;
  }

  await connectMongoDb();

  const session = await sessionRepository.findSessionUserIdBySessionId({
    sessionId,
  });

  if (session === null) {
    return null;
  }

  return userRepository.getMe({
    id: session.userId,
  });
};

export const getCurrentUserForPage = cache(loadCurrentUserForPage);
