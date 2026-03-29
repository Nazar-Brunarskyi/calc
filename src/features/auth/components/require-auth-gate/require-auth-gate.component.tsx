"use client";

import { useUser } from "@/src/features/user/hooks/use-user.hook";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

export const RequireAuthGate = ({ children }: IProps) => {
  const user = useUser();
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
