"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import type { ReactNode } from "react";

interface IProps {
  href: string;
  children: ReactNode;
}

export const HeaderAccountNavLinkItem = ({ href, children }: IProps) => {
  return (
    <DropdownMenuItem asChild>
      <Link href={href}>{children}</Link>
    </DropdownMenuItem>
  );
};
