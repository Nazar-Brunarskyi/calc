import type { IAppUser } from "@/app/api/_shared/interfaces/app-user.interface";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";

/** Context for routes that use `withAuthMiddleware` before the handler runs. */
export interface IAuthenticatedRouteHandlerContext extends IRouteHandlerContext {
  user: IAppUser;
}
