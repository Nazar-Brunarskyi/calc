import { useAuthContext } from "@/src/features/auth/providers/auth-provider/auth-provider.component";
import type { IUserMe } from "@/src/interfaces/user-me.interface";

export const useUser = (): IUserMe | null => {
  const { user } = useAuthContext();
  return user;
};
