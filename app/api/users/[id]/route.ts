import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { userRepository } from "@/app/api/_shared/repository/user/user.repository";
import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";

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
      const user = await userRepository.findUserByIdForApi({ id });

      if (user === null) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        user: {
          _id: user._id,
          username: user.username,
        },
      });
    } catch (error: unknown) {
      console.error(error);

      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 },
      );
    }
  },
);
