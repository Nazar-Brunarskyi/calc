/**
 * Matches the userland App Router handler context (second argument to GET/POST/…).
 * @see Next.js `AppRouteHandlerFnContext` (internal type in next/server route module).
 */
export interface IRouteHandlerContext {
  params?: Promise<Record<string, string | string[] | undefined>>;
}
