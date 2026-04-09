"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/src/hooks/api/auth/use-logout.mutation.hook";

export const HeaderAccountLogoutItem = () => {
  const { mutate: logout, isPending } = useLogoutMutation();

  return (
    <DropdownMenuItem
      variant="destructive"
      className="cursor-pointer"
      disabled={isPending}
      onSelect={() => logout()}
    >
      Log out
    </DropdownMenuItem>
  );
};
