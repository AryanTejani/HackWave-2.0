"use client";
import { useSession, signOut } from 'next-auth/react';

import {
  CreditCard,
  MoreVertical,
  LogOut,
  Bell,
  User
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import Link from 'next/link';

export function NavUser({
  user,
  isCollapsed
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  isCollapsed?: boolean;
}) {
  const { isMobile } = useSidebar();
  const { data: session } = useSession();
  const userData = session?.user;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={userData?.image || ""} alt={userData?.name || ""} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userData?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{userData?.email}</span>
                </div>
              )}
              <MoreVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userData?.image || ""} alt={userData?.name || ""} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{userData?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{userData?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="h-4 w-4" />
                <Link href="/profile" className="flex items-center gap-2">
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
