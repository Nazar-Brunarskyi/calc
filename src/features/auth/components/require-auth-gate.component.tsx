"use client";

import { useAuth } from "@/src/features/auth/providers/auth-provider.component";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

export const RequireAuthGate = ({ children }: IProps) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  if (user === null) {
    return null;
  }

  return <>{children}</>;
};
