import type { ISchemaDefinition } from "DB/interfaces";
import mongoose from "mongoose";
import type { IUserSchema } from "./user-schema.interface";

const userSchemaName: string = "users";

const UserSchema = new mongoose.Schema<IUserSchema>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    googleSub: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    collection: userSchemaName,
  },
);

export const UserSchemaDefinition: ISchemaDefinition<IUserSchema> = {
  name: userSchemaName,
  schema: UserSchema,
};
