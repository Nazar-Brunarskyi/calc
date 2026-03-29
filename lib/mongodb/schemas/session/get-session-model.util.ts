import type mongoose from "mongoose";

import type { ISessionSchema } from "./session-schema.interface";
import { SessionSchemaDefinition } from "./session.schema";

export const getSessionModel = (
  m: typeof mongoose,
): mongoose.Model<ISessionSchema> => {
  const name = SessionSchemaDefinition.name;
  const existing = m.models[name] as mongoose.Model<ISessionSchema> | undefined;
  return (
    existing ?? m.model<ISessionSchema>(name, SessionSchemaDefinition.schema)
  );
};
