import type { IAppUser } from "@/app/api/_shared/interfaces/app-user.interface";
import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";
import { withAuthMiddleware } from "@/app/api/_shared/route-handlers/with-auth-route-middleware.util";
import { withValidatedBody } from "@/app/api/_shared/features/zod-validations/middlewares/with-validated-body-route-middleware.util";
import { sendResponse } from "@/app/api/_shared/utils/send-response.util";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type {
  IPostTestBodyValidationRequestDto,
  IPostTestBodyValidationResponseDto,
} from "@/src/DTOs/test/post-test-body-validation.dto";
import { type ZodType, z } from "zod";

const bodySchema: ZodType<IPostTestBodyValidationRequestDto> = z.object({
  message: z.string().min(1),
  text: z.string().nullable().optional(),
});

type TCtx = IRouteHandlerContext & {
  user: IAppUser;
  body: IPostTestBodyValidationRequestDto;
};

export const POST = createGlobalRouteHandler<TCtx>(
  async (_request, { body }) =>
    sendResponse<IPostTestBodyValidationResponseDto>({
      echoed: body.message,
    }),
  {
    middleware: [withAuthMiddleware, withValidatedBody(bodySchema)],
  },
);
