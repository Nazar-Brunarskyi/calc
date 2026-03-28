import { BadRequestError } from "@/app/api/_shared/features/error-handling/instances/bad-request-error";
import { NotFoundError } from "@/app/api/_shared/features/error-handling/instances/not-found-error";
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
      throw new BadRequestError({ message: "Invalid user id" });
    }

    const user = await userRepository.findUserByIdForApi({ id });

    if (user === null) {
      throw new NotFoundError({ message: "User not found" });
    }

    return sendResponse<IGetUserSuccessBody>({
      user: {
        _id: user._id,
        username: user.username,
      },
    });
  },
);
