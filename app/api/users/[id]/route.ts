import { userRepository } from "@/app/api/_shared/repository/user/user.repository";
import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";
import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

interface IRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = createGlobalRouteHandler<IRouteContext>(
  async (_request: NextRequest, context: IRouteContext) => {
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendResponse({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await userRepository.findUserByIdForApi({ id });

    if (user === null) {
      return sendResponse({ error: "User not found" }, { status: 404 });
    }

    return sendResponse({
      user: {
        _id: user._id,
        username: user.username,
      },
    });
  },
);
