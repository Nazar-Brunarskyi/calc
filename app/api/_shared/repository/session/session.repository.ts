import { randomBytes } from "crypto";
import { getSessionModel } from "DB/schemas/session";
import type { ISessionSchema } from "@/lib/mongodb/schemas/session/session-schema.interface";
import { DateTime } from "luxon";
import mongoose from "mongoose";

const SESSION_DURATION_DAYS = 7;

export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_DAYS * 24 * 60 * 60;

export interface ICreateSessionForUserProps {
  userId: string;
}

export interface IFindSessionUserIdBySessionIdProps {
  sessionId: string;
}

export interface IDeleteBySessionIdProps {
  sessionId: string;
}

const findSessionUserIdBySessionId = async ({
  sessionId,
}: IFindSessionUserIdBySessionIdProps): Promise<ISessionSchema | null> => {
  const Session = getSessionModel(mongoose);
  const session = await Session.findOne({
    sessionId,
    expiresAt: { $gt: new Date() },
  }).lean();

  if (session === null) {
    return null;
  }

  return {
    _id: String(session._id),
    sessionId: session.sessionId,
    user: session.user,
    expiresAt: session.expiresAt,
  };
};

const createSessionForUser = async ({
  userId,
}: ICreateSessionForUserProps): Promise<{ sessionId: string }> => {
  const Session = getSessionModel(mongoose);
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = DateTime.now()
    .plus({ days: SESSION_DURATION_DAYS })
    .toJSDate();

  await Session.create({
    sessionId,
    user: new mongoose.Types.ObjectId(userId),
    expiresAt,
  });

  return { sessionId };
};

const deleteBySessionId = async ({
  sessionId,
}: IDeleteBySessionIdProps): Promise<void> => {
  const Session = getSessionModel(mongoose);
  await Session.deleteOne({ sessionId });
};

export const sessionRepository = {
  createSessionForUser,
  findSessionUserIdBySessionId,
  deleteBySessionId,
};
