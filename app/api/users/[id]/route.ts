import { AppError } from "@/app/api/_shared/features/error-handling/instances/app-error";
import { userRepository } from "@/app/api/_shared/repository/user/user.repository";
import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";
import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

type IGetUserSuccessBody = {
  user: {
    _id: string;
    username: string;
  };
};

interface IRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = createGlobalRouteHandler<IRouteContext>(
  async (_request: NextRequest, context: IRouteContext) => {
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError({
        message: "Invalid user id",
        statusCode: 400,
      });
    }

    const user = await userRepository.findUserByIdForApi({ id });

    if (user === null) {
      throw new AppError({
        message: "User not found",
        statusCode: 404,
      });
    }

    return sendResponse<IGetUserSuccessBody>({
      user: {
        _id: user._id,
        username: user.username,
      },
    });
  },
);
