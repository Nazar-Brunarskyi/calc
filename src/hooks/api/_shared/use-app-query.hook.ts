"use client";

import type { TAsyncLazyFn } from "@/src/hooks/api/_shared/use-error-handler.hook";
import { useGlobalErrorHandlers } from "@/src/hooks/api/_shared/use-global-error-handlers.hook";
import {
  type DefaultError,
  type QueryKey,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

export type TUseAppQueryOptions<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryFn"> & {
  queryFn: TAsyncLazyFn<TQueryFnData>;
};

export const useAppQuery = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: TUseAppQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> => {
  const { queryFn, ...rest } = options;
  const { wrapFunction } = useGlobalErrorHandlers();

  return useQuery({
    retry: false,
    ...rest,
    queryFn: wrapFunction(queryFn),
  } as UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>);
};
