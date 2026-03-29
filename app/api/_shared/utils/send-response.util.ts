import { NextResponse } from "next/server";

export const sendResponse = <JsonBody extends object>(
  body: JsonBody,
  options?: ResponseInit,
): NextResponse<JsonBody> => {
  return NextResponse.json(body, options);
};
