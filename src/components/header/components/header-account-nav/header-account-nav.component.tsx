"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

import { HeaderAccountLogoutItem } from "../header-account-logout-item/header-account-logout-item.component";
import { HeaderAccountNavLinkItem } from "../header-account-nav-link-item/header-account-nav-link-item.component";

export const HeaderAccountNav = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          Account
          <ChevronDownIcon aria-hidden className="size-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-40">
        <HeaderAccountNavLinkItem href="/profile">
          Profile
        </HeaderAccountNavLinkItem>

        <HeaderAccountLogoutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
