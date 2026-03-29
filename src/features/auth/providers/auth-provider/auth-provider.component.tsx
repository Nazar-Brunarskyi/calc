"use client";

import type { IUserMe } from "@/src/interfaces/user-me.interface";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface IAuthContextValue {
  user: IUserMe | null;
  setUser: (user: IUserMe | null) => void;
}

const AuthContext = createContext<IAuthContextValue | null>(null);

interface IAuthProviderProps {
  children: ReactNode;
  initialUser: IUserMe | null;
}

export const AuthProvider = ({ children, initialUser }: IAuthProviderProps) => {
  const [user, setUserState] = useState<IUserMe | null>(initialUser);

  useEffect(() => {
    setUserState(initialUser);
  }, [initialUser]);

  const setUser = useCallback((next: IUserMe | null) => {
    setUserState(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): IAuthContextValue => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
};
