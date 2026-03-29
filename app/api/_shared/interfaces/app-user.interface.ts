import type { IUserSchema } from "DB/schemas/user";

export interface IAppUser extends Omit<IUserSchema, "_id"> {
  id: string;
}
