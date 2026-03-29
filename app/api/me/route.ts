import { AppError } from "@/app/api/_shared/features/error-handling/instances/app-error";
import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";
import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import type { IUserMe } from "@/src/interfaces/user-me.interface";
import { getCurrentUserForPage } from "@/src/utils/server/get-current-user-for-page.util";

type IMeSuccessBody = {
  user: IUserMe;
};

export const GET = createGlobalRouteHandler(
  async () => {
    const user = await getCurrentUserForPage();

    if (user === null) {
      throw new AppError({
        message: "Unauthorized",
        statusCode: 401,
        name: "unauthorized",
      });
    }

    return sendResponse<IMeSuccessBody>({ user });
  },
);
