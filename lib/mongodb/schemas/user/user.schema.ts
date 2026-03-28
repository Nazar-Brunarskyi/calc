import type { ISchemaDefinition } from "DB/interfaces";
import type { IUserSchema } from "./user-schema.interface";
import mongoose from "mongoose";

const userSchemaName: string = "users";

const UserSchema = new mongoose.Schema<IUserSchema>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    collection: userSchemaName,
  }
);

export const UserSchemaDefinition: ISchemaDefinition<IUserSchema> = {
  name: userSchemaName,
  schema: UserSchema,
};
