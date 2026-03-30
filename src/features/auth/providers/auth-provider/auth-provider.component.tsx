"use client";

import { useMeQuery } from "@/src/hooks/api/user/use-me.query.hook";
import { userQueryKeys } from "@/src/hooks/api/user/user.query-keys.const";
import type { IUserMe } from "@/src/interfaces/user-me.interface";
import {
  useQueryClient,
  type QueryObserverResult,
} from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

interface IUserLoaderState {
  isUserLoading: boolean;
  isUserFetching: boolean;
  isUserPending: boolean;
}
interface IAuthContextValue {
  user: IUserMe | null;
  userLoaderState: IUserLoaderState;
  setUser: (user: IUserMe | null) => void;
  refetchUser: () => Promise<QueryObserverResult<IUserMe | null, Error>>;
}

const AuthContext = createContext<IAuthContextValue | null>(null);

interface IAuthProviderProps {
  children: ReactNode;
  initialUser: IUserMe | null;
}

export const AuthProvider = ({ children, initialUser }: IAuthProviderProps) => {
  const queryClient = useQueryClient();
  const {
    data: user,
    refetch: refetchUser,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
    isPending: isUserPending,
  } = useMeQuery({ initialUser });

  const setUser = useCallback(
    (next: IUserMe | null) => {
      queryClient.setQueryData(userQueryKeys.me(), next);
    },
    [queryClient],
  );

  const value: IAuthContextValue = useMemo(
    () => ({
      user: user ?? null,
      isUserLoading: isUserLoading || isUserFetching || isUserPending,
      userLoaderState: {
        isUserLoading,
        isUserFetching,
        isUserPending,
      },
      setUser,
      refetchUser,
    }),
    [user, setUser, refetchUser, isUserLoading, isUserFetching, isUserPending],
  );

  useEffect(() => {
    queryClient.setQueryData(userQueryKeys.me(), initialUser);
  }, [initialUser, queryClient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): IAuthContextValue => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
};
