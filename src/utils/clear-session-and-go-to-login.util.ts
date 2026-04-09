import { userQueryKeys } from "@/src/hooks/api/user/user.query-keys.const";
import type { QueryClient } from "@tanstack/react-query";

export interface IClearSessionAndGoToLoginProps {
  queryClient: QueryClient;
  replace: (href: string) => void;
}

export const clearSessionAndGoToLogin = ({
  queryClient,
  replace,
}: IClearSessionAndGoToLoginProps): void => {
  queryClient.setQueryData(userQueryKeys.me(), null);
  replace("/login");
};
