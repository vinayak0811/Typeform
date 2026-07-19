"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/features/dashboard/user-menu";

const TABS = [
  { href: "/forms", label: "Published forms" },
  { href: "/dashboard", label: "My forms" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex items-center gap-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "focus-ring rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <UserMenu />
    </div>
  );
}
