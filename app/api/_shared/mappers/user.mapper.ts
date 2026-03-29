import type { IAppUser } from "@/app/api/_shared/interfaces/app-user.interface";
import type { IUserMe } from "@/src/interfaces/user-me.interface";
import type { IUserSchema } from "DB/schemas/user";

const toAppUser = (doc: IUserSchema): IAppUser => {
  const user: IAppUser = {
    id: String(doc._id),
    username: doc.username,
    email: doc.email,
    googleSub: doc.googleSub ?? undefined,
  };

  return user;
};

const toUserMe = (user: IAppUser): IUserMe => {
  return {
    username: user.username,
  };
};

export const userMapper = {
  toAppUser,
  toUserMe,
};
