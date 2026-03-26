import type { TAppBuilder, TAppChainHandler, TModuleNavProxy } from "./app-builder.type";

export interface IAppChainHandlerProps<TRequest, TContext> {
  request: TRequest;
  context: TContext;
}

export interface IAddMethodProps<TRequest, TContext> {
  name: string;
  handler: TAppChainHandler<TRequest, TContext>;
}

export interface IAddModuleProps<TRequest, TContext> {
  name: string;
  module: TAppBuilder<TRequest, TContext>;
}

export interface IAppInvokeProps<TRequest, TContext> {
  request?: TRequest;
  context?: TContext;
}

export interface IRootChainProxy<TRequest, TContext> {
  useModule(name: string): TModuleNavProxy<TRequest, TContext>;
}

export interface IAppChainStep {
  resp(): Promise<Response>;
}

export type IRoot<
  TRequest = Request,
  TContext = Record<string, unknown>,
  TMethodNames extends string = never,
> = IRootChainProxy<TRequest, TContext> & {
  [K in TMethodNames]: () => IAppChainStep;
};
