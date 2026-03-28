import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";

import { getUserModel } from "DB/schemas";
import { createGlobalRouteHandler } from "@/src/route-handlers/global-route-handler.util";

interface IRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = createGlobalRouteHandler<IRouteContext>(
  async (_request: NextRequest, context: IRouteContext) => {
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    try {
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
);
