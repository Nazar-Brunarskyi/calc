import { randomBytes } from "crypto";
import type { Model } from "mongoose";
import mongoose from "mongoose";

import { getUserModel } from "DB/schemas";
import type { IUserSchema } from "DB/schemas/user";

export interface IFindOrCreateGoogleUserProps {
  googleSub: string;
  email: string;
  name?: string;
}

export interface IFindUserByIdForApiProps {
  id: string;
}

export interface IUserPublicApiShape {
  _id: string;
  username: string;
}

interface IDeriveBaseGoogleUsernameProps {
  email: string;
  name?: string;
}

interface IAllocateUniqueUsernameProps {
  User: Model<IUserSchema>;
  base: string;
}

/**
 * PRIVATE
 */
const sanitizeUsernamePart = (value: string): string => {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
  return cleaned.length > 0 ? cleaned.slice(0, 30) : "user";
};

/**
 * PRIVATE
 */
const deriveBaseGoogleUsername = ({
  email,
  name,
}: IDeriveBaseGoogleUsernameProps): string => {
  const localPart = email.split("@")[0] ?? "";
  const fromEmail = sanitizeUsernamePart(localPart);
  if (fromEmail !== "user") {
    return fromEmail;
  }
  if (name !== undefined && name.trim() !== "") {
    const fromName = sanitizeUsernamePart(name.replace(/\s+/g, "."));
    if (fromName !== "user") {
      return fromName;
    }
  }
  return "user";
};

/**
 * PRIVATE
 */
const allocateUniqueUsername = async ({
  User,
  base,
}: IAllocateUniqueUsernameProps): Promise<string> => {
  let candidate = base;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const exists = await User.exists({ username: candidate });
    if (exists === null) {
      return candidate;
    }
    const suffix = randomBytes(3).toString("hex");
    candidate = `${base.slice(0, 20)}_${suffix}`;
  }
  throw new Error("Could not allocate a unique username");
};

const findOrCreateGoogleUser = async ({
  googleSub,
  email,
  name,
}: IFindOrCreateGoogleUserProps): Promise<{ userId: string }> => {
  const User = getUserModel(mongoose);

  const existing = await User.findOne({ googleSub }).lean();
  if (existing !== null) {
    return { userId: String(existing._id) };
  }

  const baseUsername = deriveBaseGoogleUsername({ email, name });
  const username = await allocateUniqueUsername({ User, base: baseUsername });

  try {
    const created = await User.create({
      username,
      googleSub,
      email,
    });
    return { userId: String(created._id) };
  } catch {
    const raced = await User.findOne({ googleSub }).lean();
    if (raced !== null) {
      return { userId: String(raced._id) };
    }
    throw new Error("Failed to create Google user");
  }
};

const findUserByIdForApi = async ({
  id,
}: IFindUserByIdForApiProps): Promise<IUserPublicApiShape | null> => {
  const User = getUserModel(mongoose);
  const doc = await User.findById(id).lean();
  if (doc === null) {
    return null;
  }
  return {
    _id: String(doc._id),
    username: doc.username,
  };
};

export const userRepository = {
  findOrCreateGoogleUser,
  findUserByIdForApi,
};
