import { NextResponse } from "next/server";

export const sendResponse = <JsonBody>(
  body: JsonBody,
  options?: ResponseInit,
): NextResponse<JsonBody> => {
  return NextResponse.json(body, options);
};
