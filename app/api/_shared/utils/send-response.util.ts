import { NextResponse } from "next/server";

export const sendResponse = <JsonBody extends Record<string, unknown>>(
  body: JsonBody,
  options?: ResponseInit,
): NextResponse<JsonBody> => {
  return NextResponse.json(body, options);
};
