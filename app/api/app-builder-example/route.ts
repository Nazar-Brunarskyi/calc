import { AppBuilderError, app } from "@/lib/app-builder/app-builder.util";

const example = app().addMethod({
  name: "run",
  handler: ({ context }) => {
    context.testing = true;
  },
});

export async function GET(request: Request): Promise<Response> {
  const context: Record<string, unknown> = {
    test: "test",
  };
  const root = example({ request, context });
  return await root.run().resp();
}
