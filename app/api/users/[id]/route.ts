import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";
import { userRepository } from "@/app/api/_shared/repository/user/user.repository";

interface IRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = createGlobalRouteHandler<IRouteContext>(
  async (_request: NextRequest, context: IRouteContext) => {
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

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
  },
);
