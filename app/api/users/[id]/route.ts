import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";

import { connectMongoDb } from "@/lib/mongodb/connect-mongodb.util";
import { getUserModel } from "DB/schemas";

interface IRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  context: IRouteContext
): Promise<NextResponse> {
  const { id } = await context.params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    await connectMongoDb();
    const User = getUserModel(mongoose);
    const doc = await User.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      user: {
        _id: String(doc._id),
        username: doc.username,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
