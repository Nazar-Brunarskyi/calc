import { RequireAuthGate } from "@/src/features/auth/components/require-auth-gate/require-auth-gate.component";
import { getCurrentUserForPage } from "@/src/utils/server/get-current-user-for-page.util";
import { redirect } from "next/navigation";
import type { ComponentType } from "react";

export const withAuth = <P extends object>(Wrapped: ComponentType<P>) => {
  const WithAuth = async (props: P) => {
    const user = await getCurrentUserForPage();

    if (user === null) {
      redirect("/login");
    }

    return (
      <RequireAuthGate>
        <Wrapped {...props} />
      </RequireAuthGate>
    );
  };

  return WithAuth;
};
