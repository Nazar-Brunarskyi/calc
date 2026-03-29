import { getCurrentUserForPage } from "@/src/utils/server/get-current-user-for-page.util";
import { redirect } from "next/navigation";
import type { ComponentType } from "react";

export const withoutAuth = <P extends object>(Wrapped: ComponentType<P>) => {
  const WithoutAuth = async (props: P) => {
    const user = await getCurrentUserForPage();

    if (user !== null) {
      redirect("/profile");
    }

    return <Wrapped {...props} />;
  };

  return WithoutAuth;
};
