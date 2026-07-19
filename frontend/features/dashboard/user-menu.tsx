"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

export function UserMenu() {
  const user = useCurrentUser();
  const logout = useLogout();

  if (!user) return null;

  const initial = user.name.trim().charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
          aria-label="Account menu"
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2.5 py-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <UserIcon className="h-3.5 w-3.5" /> {user.name}
          </span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onClick={() => logout.mutate()}>
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
