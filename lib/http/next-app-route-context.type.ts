/**
 * Fields Next.js always provides on App Router route `context`.
 * Intersect with `IRouteHandlerContext` on handlers/middleware; do not duplicate on `IRouteHandlerContext`.
 */
export type TNextAppRouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};
