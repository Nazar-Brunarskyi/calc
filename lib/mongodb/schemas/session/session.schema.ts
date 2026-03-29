import type { ISchemaDefinition } from "DB/interfaces";
import mongoose from "mongoose";
import type { ISessionSchema } from "./session-schema.interface";

const sessionSchemaName: string = "sessions";

const SessionSchema = new mongoose.Schema<ISessionSchema>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    collection: sessionSchemaName,
  },
);

export const SessionSchemaDefinition: ISchemaDefinition<ISessionSchema> = {
  name: sessionSchemaName,
  schema: SessionSchema,
};
