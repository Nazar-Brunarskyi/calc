import { RESERVED_APP_BUILDER_CHAIN_NAMES } from "./app-builder.const";
import { AppBuilderError } from "./app-builder-error.util";
import type {
  IAddMethodProps,
  IAddModuleProps,
  IAppChainStep,
  IAppInvokeProps,
  IRoot,
  IRootChainProxy,
} from "./app-builder.interface";
import type { TAppBuilderErrorCode } from "./app-builder-error.type";
import type { TAppBuilder, TAppBuilderRegistries, TModuleNavProxy } from "./app-builder.type";

const APP_BUILDER_REGISTRIES = Symbol("appBuilderRegistries");
const APP_BUILDER_INTERNAL_ERROR_CODE = "APP_BUILDER_INTERNAL_ERROR" satisfies TAppBuilderErrorCode;

type TAppBuilderInternal<TRequest, TContext> = TAppBuilder<TRequest, TContext> & {
  [APP_BUILDER_REGISTRIES]: TAppBuilderRegistries<TRequest, TContext>;
};

function assertReservedName(name: string): void {
  if (RESERVED_APP_BUILDER_CHAIN_NAMES.has(name)) {
    throw new Error(
      `The name "${name}" is reserved for the chain API and cannot be registered as a method or module.`,
    );
  }
}

function validateAddMethodProps(
  props: unknown,
): asserts props is IAddMethodProps<unknown, Record<string, unknown>> {
  if (props === null || typeof props !== "object") {
    throw new Error("addMethod(config): `config` must be a non-null object.");
  }
  const record = props as Record<string, unknown>;
  if (typeof record["name"] !== "string" || record["name"].trim() === "") {
    throw new Error("addMethod(config): `name` is required and must be a non-empty string.");
  }
  if (typeof record["handler"] !== "function") {
    throw new Error("addMethod(config): `handler` is required and must be a function.");
  }
}

function validateAddModuleProps(
  props: unknown,
): asserts props is IAddModuleProps<unknown, Record<string, unknown>> {
  if (props === null || typeof props !== "object") {
    throw new Error("addModule(config): `config` must be a non-null object.");
  }
  const record = props as Record<string, unknown>;
  if (typeof record["name"] !== "string" || record["name"].trim() === "") {
    throw new Error("addModule(config): `name` is required and must be a non-empty string.");
  }
  if (record["module"] === null || record["module"] === undefined) {
    throw new Error("addModule(config): `module` is required.");
  }
}

function isAppBuilder(value: unknown): value is TAppBuilderInternal<unknown, Record<string, unknown>> {
  if (typeof value !== "function") {
    return false;
  }
  const candidate = value as TAppBuilderInternal<unknown, Record<string, unknown>>;
  return (
    APP_BUILDER_REGISTRIES in candidate &&
    typeof candidate[APP_BUILDER_REGISTRIES] === "object" &&
    candidate[APP_BUILDER_REGISTRIES] !== null
  );
}

function readRegistries<TRequest, TContext>(
  builder: TAppBuilder<TRequest, TContext>,
): TAppBuilderRegistries<TRequest, TContext> {
  const internal = builder as TAppBuilderInternal<TRequest, TContext>;
  return internal[APP_BUILDER_REGISTRIES];
}

function toAppBuilderError(error: unknown): AppBuilderError {
  if (error instanceof AppBuilderError) {
    return error;
  }
  if (error instanceof Error) {
    return new AppBuilderError({
      message: error.message,
      code: APP_BUILDER_INTERNAL_ERROR_CODE,
      cause: error,
    });
  }
  return new AppBuilderError({
    message: String(error),
    code: APP_BUILDER_INTERNAL_ERROR_CODE,
    cause: error,
  });
}

function buildErrorResponse(error: unknown): Response {
  const appError = toAppBuilderError(error);
  return Response.json(
    {
      message: appError.message,
      code: appError.code,
      status: appError.status,
    },
    { status: appError.status },
  );
}

function buildRootProxy<
  TRequest,
  TContext extends Record<string, unknown>,
  TMethodNames extends string,
>(
  registries: TAppBuilderRegistries<TRequest, TContext>,
  request: TRequest,
  context: TContext,
): IRoot<TRequest, TContext, TMethodNames> {
  const navigateToModule = (name: string): TModuleNavProxy<TRequest, TContext> => {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error('useModule(name): `name` must be a non-empty string.');
    }
    const childBuilder = registries.modules.get(name);
    if (!childBuilder) {
      throw new Error(
        `useModule("${name}"): no module with that name is registered on this app builder.`,
      );
    }
    const childRegistries = readRegistries(childBuilder);
    return buildModuleNavProxy(childRegistries, request, context);
  };

  const rootTarget: IRootChainProxy<TRequest, TContext> = {
    useModule: navigateToModule,
  };

  const rootProxy = new Proxy(rootTarget, {
    get(target, prop) {
      if (prop === "useModule") {
        return target.useModule;
      }

      if (prop === "then" || prop === "constructor") {
        return undefined;
      }

      const key = String(prop);
      const handler = registries.methods.get(key);
      if (!handler) {
        throw new Error(
          `Unknown root chain property "${key}". Register it with addMethod() or enter a module with useModule().`,
        );
      }

      return (): IAppChainStep => {
        const done = Promise.resolve().then(() => handler({ request, context }));
        return {
          resp(): Promise<Response> {
            return done.then(() => Response.json(context)).catch(buildErrorResponse);
          },
        };
      };
    },
  });

  return rootProxy as IRoot<TRequest, TContext, TMethodNames>;
}

function buildModuleNavProxy<TRequest, TContext>(
  registries: TAppBuilderRegistries<TRequest, TContext>,
  request: TRequest,
  context: TContext,
): TModuleNavProxy<TRequest, TContext> {
  const navigateToModule = (name: string): TModuleNavProxy<TRequest, TContext> => {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error('useModule(name): `name` must be a non-empty string.');
    }
    const childBuilder = registries.modules.get(name);
    if (!childBuilder) {
      throw new Error(
        `useModule("${name}"): no module with that name is registered on the current module.`,
      );
    }
    const childRegistries = readRegistries(childBuilder);
    return buildModuleNavProxy(childRegistries, request, context);
  };

  const base: TModuleNavProxy<TRequest, TContext> = {};
  if (registries.modules.size > 0) {
    base.useModule = navigateToModule;
  }

  return new Proxy(base, {
    get(target, prop) {
      if (prop === "then" || prop === "constructor") {
        return undefined;
      }

      if (prop === "useModule") {
        const fn = target.useModule;
        if (!fn) {
          throw new Error(
            "This module has no nested modules; `useModule` is not available here.",
          );
        }
        return fn;
      }

      const key = String(prop);
      const handler = registries.methods.get(key);
      if (!handler) {
        throw new Error(
          `Unknown module chain property "${key}". Register it on the module builder with addMethod().`,
        );
      }

      return (): Promise<void> => Promise.resolve(handler({ request, context }));
    },
  });
}

function makeApp<
  TRequest,
  TContext extends Record<string, unknown>,
  TMethodNames extends string,
>(registries: TAppBuilderRegistries<TRequest, TContext>): TAppBuilder<TRequest, TContext, TMethodNames> {
  const addMethod = <const N extends string>(
    props: Omit<IAddMethodProps<TRequest, TContext>, "name"> & { name: N },
  ): TAppBuilder<TRequest, TContext, TMethodNames | N> => {
    validateAddMethodProps(props as unknown);
    assertReservedName(props.name);
    if (registries.modules.has(props.name)) {
      throw new Error(
        `Cannot add method "${props.name}" because a module with the same name is already registered.`,
      );
    }
    if (registries.methods.has(props.name)) {
      throw new Error(`Method "${props.name}" is already registered on this app builder.`);
    }
    registries.methods.set(props.name, props.handler);
    return makeApp<TRequest, TContext, TMethodNames | N>(registries);
  };

  const addModule = (props: IAddModuleProps<TRequest, TContext>): TAppBuilder<TRequest, TContext, TMethodNames> => {
    validateAddModuleProps(props as unknown);
    assertReservedName(props.name);
    if (registries.methods.has(props.name)) {
      throw new Error(
        `Cannot add module "${props.name}" because a method with the same name is already registered.`,
      );
    }
    if (registries.modules.has(props.name)) {
      throw new Error(`Module "${props.name}" is already registered on this app builder.`);
    }
    if (!isAppBuilder(props.module)) {
      throw new Error(
        "addModule(config): `module` must be a builder instance returned by app() (wrong type or missing internal registry).",
      );
    }
    registries.modules.set(props.name, props.module);
    return makeApp<TRequest, TContext, TMethodNames>(registries);
  };

  const invoke = (props?: IAppInvokeProps<TRequest, TContext>): IRoot<TRequest, TContext, TMethodNames> => {
    const request = (props?.request ?? ({} as TRequest)) as TRequest;
    const context = (props?.context ?? ({} as TContext)) as TContext;
    return buildRootProxy<TRequest, TContext, TMethodNames>(registries, request, context);
  };

  const builder = Object.assign(invoke, { addMethod, addModule }) as TAppBuilder<
    TRequest,
    TContext,
    TMethodNames
  >;

  Object.defineProperty(builder, APP_BUILDER_REGISTRIES, {
    value: registries,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return builder;
}

export function app<
  TRequest = Request,
  TContext extends Record<string, unknown> = Record<string, unknown>,
>(): TAppBuilder<TRequest, TContext, never> {
  const registries: TAppBuilderRegistries<TRequest, TContext> = {
    methods: new Map(),
    modules: new Map(),
  };
  return makeApp<TRequest, TContext, never>(registries);
}
