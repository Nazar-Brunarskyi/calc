import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectMongoDb } from "@/lib/mongodb/connect-mongodb.util";
import { getUserModel } from "DB/schemas";

interface ICreateUserBody {
  username: string;
}

async function parseUsernameFromRequest(
  request: NextRequest
): Promise<
  | { ok: true; username: string }
  | { ok: false; response: NextResponse }
> {
  const contentType = request.headers.get("content-type") ?? "";
  let rawUsername: unknown;

  if (contentType.includes("application/json")) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return {
        ok: false,
        response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
      };
    }
    if (
      typeof body !== "object" ||
      body === null ||
      !("username" in body)
    ) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "username is required (non-empty string)" },
          { status: 400 }
        ),
      };
    }
    rawUsername = (body as ICreateUserBody).username;
  } else {
    const formData = await request.formData();
    rawUsername = formData.get("username");
  }

  if (typeof rawUsername !== "string" || !rawUsername.trim()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "username is required (non-empty string)" },
        { status: 400 }
      ),
    };
  }

  return { ok: true, username: rawUsername.trim() };
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function POST(request: NextRequest) {
  console.log("POST /api/users");
  const parsed = await parseUsernameFromRequest(request);
  if (!parsed.ok) {
    return parsed.response;
  }
  const { username } = parsed;

  try {
    await connectMongoDb();
    const User = getUserModel(mongoose);
    const doc = await User.create({ username });
    return NextResponse.json(
      {
        user: {
          _id: String(doc._id),
          username: doc.username,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: "username already exists" },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
