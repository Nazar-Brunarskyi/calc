import { app } from "./app-builder-internal.util";
import { AppBuilderError } from "./app-builder-error.util";
import type { IAppChainHandlerProps, IAppChainStep } from "./app-builder.interface";
import type { TAppBuilder, TAppChainHandler, TModuleNavProxy } from "./app-builder.type";

function assertCondition(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`app-builder self-test failed: ${message}`);
  }
}

function getRootChainMethod(proxy: unknown, methodName: string): () => IAppChainStep {
  const record = proxy as Record<string, unknown>;
  const fn = record[methodName];
  if (typeof fn !== "function") {
    throw new Error(`Self-test: expected root chain method "${methodName}".`);
  }
  return fn as () => IAppChainStep;
}

function getModuleChainMethod(
  proxy: TModuleNavProxy<unknown, Record<string, unknown>>,
  methodName: string,
): () => Promise<void> {
  const record = proxy as unknown as Record<string, unknown>;
  const fn = record[methodName];
  if (typeof fn !== "function") {
    throw new Error(`Self-test: expected module chain method "${methodName}".`);
  }
  return fn as () => Promise<void>;
}

type TTestChainContext = Record<string, unknown>;
type TTestHandlerProps = IAppChainHandlerProps<unknown, TTestChainContext>;

async function runAppBuilderSelfTests(): Promise<void> {
  const order: string[] = [];

  const root = app<{ id: string }, Record<string, unknown>>()
    .addMethod({
      name: "isAuthorized",
      handler: () => {
        order.push("isAuthorized");
      },
    })
    .addMethod({
      name: "isAuthorised",
      handler: async () => {
        await Promise.resolve();
        order.push("isAuthorised");
      },
    });

  await getRootChainMethod(root(), "isAuthorized")().resp();
  await getRootChainMethod(root(), "isAuthorised")().resp();
  assertCondition(order.join(",") === "isAuthorized,isAuthorised", "root async/sync method order");

  const errored = app().addMethod({
    name: "explode",
    handler: () => {
      throw new AppBuilderError({
        message: "app-builder example: intentional handler error",
        code: "APP_BUILDER_EXAMPLE_ERROR",
        status: 400,
      });
    },
  });
  const errorResponse = await getRootChainMethod(errored(), "explode")().resp();
  const errorJson = (await errorResponse.json()) as { code?: unknown; message?: unknown; status?: unknown };
  assertCondition(errorResponse.status === 400, "AppBuilderError status is returned by global filter");
  assertCondition(
    errorJson["code"] === "APP_BUILDER_EXAMPLE_ERROR",
    "AppBuilderError code is returned by global filter",
  );
  assertCondition(
    errorJson["message"] === "app-builder example: intentional handler error",
    "AppBuilderError message is returned by global filter",
  );
  assertCondition(errorJson["status"] === 400, "AppBuilderError status is included in response body");

  const ctxRoot = app<unknown, TTestChainContext>().addMethod({
    name: "setUser",
    handler: ({ context }: TTestHandlerProps) => {
      context["user"] = { id: "u1" };
    },
  });

  const shared: Record<string, unknown> = {};
  await getRootChainMethod(ctxRoot({ context: shared }), "setUser")().resp();
  assertCondition(
    (shared["user"] as { id: string } | undefined)?.id === "u1",
    "context mutation visible on same object",
  );

  const profiles = app<unknown, TTestChainContext>()
    .addMethod({
      name: "someHelper",
      handler: ({ context }: TTestHandlerProps) => {
        order.push(`helper:${String(context["tag"])}`);
      },
    })
    .addMethod({
      name: "profiles",
      handler: ({ context }: TTestHandlerProps) => {
        context["profilesDone"] = true;
      },
    });

  const APP = app<unknown, Record<string, unknown>>()
    .addMethod({
      name: "gate",
      handler: () => {
        order.push("gate");
      },
    })
    .addModule({ name: "profiles", module: profiles });

  order.length = 0;
  await getRootChainMethod(APP(), "gate")().resp();
  await getModuleChainMethod(
    APP().useModule("profiles") as TModuleNavProxy<unknown, Record<string, unknown>>,
    "someHelper",
  )();
  assertCondition(order[order.length - 1] === "helper:undefined", "module method runs after root");

  order.length = 0;
  const mixedCtx: Record<string, unknown> = { tag: "mixed" };
  await getRootChainMethod(APP({ context: mixedCtx }), "gate")().resp();
  await getModuleChainMethod(
    APP({ context: mixedCtx }).useModule("profiles") as TModuleNavProxy<unknown, Record<string, unknown>>,
    "someHelper",
  )();
  assertCondition(order[order.length - 1] === "helper:mixed", "module sees shared context from root");

  const terminalCtx: Record<string, unknown> = {};
  const end = await getModuleChainMethod(
    APP({ context: terminalCtx }).useModule("profiles") as TModuleNavProxy<unknown, Record<string, unknown>>,
    "profiles",
  )();
  assertCondition(end === undefined, "module method chain is terminal (void)");
  assertCondition(terminalCtx["profilesDone"] === true, "terminal module handler mutates shared context");

  let threw = false;
  try {
    app().addMethod({ name: "", handler: () => {} });
  } catch {
    threw = true;
  }
  assertCondition(threw, "addMethod rejects empty name");

  threw = false;
  try {
    app().addMethod({
      name: "x",
      handler: 1 as unknown as TAppChainHandler<unknown, Record<string, unknown>>,
    });
  } catch {
    threw = true;
  }
  assertCondition(threw, "addMethod rejects non-function handler");

  threw = false;
  try {
    app().addMethod({ name: "dup", handler: () => {} }).addMethod({ name: "dup", handler: () => {} });
  } catch {
    threw = true;
  }
  assertCondition(threw, "duplicate method name throws");

  threw = false;
  try {
    const builderWithMethod = app().addMethod({ name: "only", handler: () => {} });
    builderWithMethod.addModule({ name: "only", module: app() });
  } catch {
    threw = true;
  }
  assertCondition(threw, "method/module name collision throws");

  threw = false;
  try {
    app().addModule({
      name: "bad",
      module: {} as TAppBuilder<unknown, Record<string, unknown>>,
    });
  } catch {
    threw = true;
  }
  assertCondition(threw, "addModule rejects non-builder module");

  threw = false;
  try {
    APP().useModule("missing");
  } catch {
    threw = true;
  }
  assertCondition(threw, "useModule throws for unknown module");

  threw = false;
  try {
    void (APP() as unknown as Record<string, unknown>)["nope"];
  } catch {
    threw = true;
  }
  assertCondition(threw, "unknown root property throws");

  threw = false;
  try {
    app().addMethod({ name: "useModule", handler: () => {} });
  } catch {
    threw = true;
  }
  assertCondition(threw, "reserved name useModule cannot be registered");
}

void runAppBuilderSelfTests().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  throw new Error(message);
});
