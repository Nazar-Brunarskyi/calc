import type mongoose from "mongoose";

export interface ISchemaDefinition<T> {
  name: string;
  schema: mongoose.Schema<T>;
}
