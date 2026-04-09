"use client";

import { useGlobalErrorHandlers } from "@/src/hooks/api/_shared/use-global-error-handlers.hook";
import {
  type DefaultError,
  type MutationFunctionContext,
  type QueryClient,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

export type TUseAppMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  "mutationFn"
> & {
  mutationFn: (
    variables: TVariables,
    context: MutationFunctionContext,
  ) => Promise<TData>;
};

export const useAppMutation = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options: TUseAppMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> => {
  const { mutationFn, ...rest } = options;
  const { wrapFunction } = useGlobalErrorHandlers();

  const mutationFnWithGlobalHandlers = (
    variables: TVariables,
    context: MutationFunctionContext,
  ) => wrapFunction(() => mutationFn(variables, context))();

  return useMutation(
    {
      ...rest,
      mutationFn: mutationFnWithGlobalHandlers,
    } as UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
    queryClient,
  );
};
