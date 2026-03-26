/**
 * Chainable app builder — public entry. All modules for this feature live under
 * `lib/app-builder/`.
 */

export { app } from "./app-builder-internal.util";
export { AppBuilderError } from "./app-builder-error.util";
export type { TAppBuilderErrorCode } from "./app-builder-error.type";

export type {
  IAddMethodProps,
  IAddModuleProps,
  IAppChainHandlerProps,
  IAppChainStep,
  IAppInvokeProps,
  IRoot,
  IRootChainProxy,
} from "./app-builder.interface";

export type {
  TAppBuilder,
  TAppBuilderCallable,
  TAppBuilderRegistries,
  TAppChainHandler,
  TModuleNavProxy,
} from "./app-builder.type";

import "./app-builder-self-test.util";
