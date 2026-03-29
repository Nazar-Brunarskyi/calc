import type { Types } from "mongoose";

export interface ISessionSchema {
  _id: string;
  sessionId: string;
  user: Types.ObjectId;
  expiresAt: Date;
}
