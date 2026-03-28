import { randomBytes } from "crypto";
import { getSessionModel } from "DB/schemas/session";
import { DateTime } from "luxon";
import mongoose from "mongoose";

const SESSION_DURATION_DAYS = 7;

export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_DAYS * 24 * 60 * 60;

export interface ICreateSessionForUserProps {
  userId: string;
}

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

export const sessionRepository = {
  createSessionForUser,
};
