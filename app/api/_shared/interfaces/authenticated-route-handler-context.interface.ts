import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { IUserMe } from "@/src/interfaces/user-me.interface";

/** Context for routes that use `withAuthMiddleware` before the handler runs. */
export interface IAuthenticatedRouteHandlerContext extends IRouteHandlerContext {
  user: IUserMe;
}
