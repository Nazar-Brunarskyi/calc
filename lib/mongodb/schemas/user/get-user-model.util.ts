import type mongoose from "mongoose";

import type { IUserSchema } from "./user-schema.interface";
import { UserSchemaDefinition } from "./user.schema";

export function getUserModel(m: typeof mongoose): mongoose.Model<IUserSchema> {
  const name = UserSchemaDefinition.name;
  const existing = m.models[name] as mongoose.Model<IUserSchema> | undefined;
  return existing ?? m.model<IUserSchema>(name, UserSchemaDefinition.schema);
}
