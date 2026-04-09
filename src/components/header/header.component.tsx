import { cn } from "@/lib/shadcn/class-names.util";
import Link from "next/link";
import type { ReactNode } from "react";
import { HeaderAccountNav } from "./components/header-account-nav/header-account-nav.component";

interface IProps {
  title?: string;
  className?: string;
  children?: ReactNode;
}

export const Header = ({ title = "Calc", className, children }: IProps) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-foreground transition hover:text-muted-foreground"
        >
          {title}
        </Link>
        <nav
          aria-label="Main"
          className="flex items-center gap-4 text-sm font-medium"
        >
          <HeaderAccountNav />
          {children}
        </nav>
      </div>
    </header>
  );
};
