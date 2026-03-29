import type { IAppUser } from "@/app/api/_shared/interfaces/app-user.interface";

/**
 * App Router route `context` fields this stack mutates or reads.
 * `user` / `body` / `query` are set by middleware when used; omit them on routes that do not apply that middleware.
 */
export interface IRouteHandlerContext {
  user?: IAppUser;
  body?: unknown;
  query?: unknown;
}
