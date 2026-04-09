import type { IAppUser } from "@/app/api/_shared/interfaces/app-user.interface";
import type { ISessionSchema } from "@/lib/mongodb/schemas/session/session-schema.interface";

/**
 * App Router route `context` fields this stack mutates or reads.
 * `user` / `session` / `body` / `query` are set by middleware when used; omit them on routes that do not apply that middleware.
 */
export interface IRouteHandlerContext {
  user?: IAppUser;
  session?: ISessionSchema;
  body?: unknown;
  query?: unknown;
}
