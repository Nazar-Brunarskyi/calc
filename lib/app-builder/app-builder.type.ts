import type {
  IAddMethodProps,
  IAddModuleProps,
  IAppChainHandlerProps,
  IAppInvokeProps,
  IRoot,
} from "./app-builder.interface";

export type TAppChainHandler<TRequest, TContext> = (
  props: IAppChainHandlerProps<TRequest, TContext>,
) => void | Promise<void>;

export type TModuleNavProxy<TRequest, TContext> = {
  useModule?: (name: string) => TModuleNavProxy<TRequest, TContext>;
};

export type TAppBuilderCallable<
  TRequest,
  TContext,
  TMethodNames extends string = never,
> = {
  (props?: IAppInvokeProps<TRequest, TContext>): IRoot<TRequest, TContext, TMethodNames>;
};

export type TAppBuilder<
  TRequest = Request,
  TContext = Record<string, unknown>,
  TMethodNames extends string = never,
> = TAppBuilderCallable<TRequest, TContext, TMethodNames> & {
  addMethod<const N extends string>(
    props: Omit<IAddMethodProps<TRequest, TContext>, "name"> & { name: N },
  ): TAppBuilder<TRequest, TContext, TMethodNames | N>;
  addModule(props: IAddModuleProps<TRequest, TContext>): TAppBuilder<TRequest, TContext, TMethodNames>;
};

export type TAppBuilderRegistries<TRequest, TContext> = {
  methods: Map<string, TAppChainHandler<TRequest, TContext>>;
  modules: Map<string, TAppBuilder<TRequest, TContext>>;
};
