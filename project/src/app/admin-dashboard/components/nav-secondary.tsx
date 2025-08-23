"use client";

import * as React from "react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { DashboardSection } from "../page";

interface NavSecondaryProps {
  items: Array<{
    title: string;
    section?: DashboardSection;
    url?: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  className?: string;
  activeSection?: DashboardSection;
  onSectionChange?: (section: DashboardSection) => void;
}

export function NavSecondary({ items, className, activeSection, onSectionChange }: NavSecondaryProps) {
  return (
    <SidebarMenu className={className}>
      {items.map((item, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton
            asChild
            isActive={activeSection === item.section}
            className="data-[slot=sidebar-menu-button]:!p-3"
          >
            {item.section ? (
              <button
                onClick={() => onSectionChange?.(item.section!)}
                className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.title}
                </span>
              </button>
            ) : (
              <a
                href={item.url}
                className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.title}
                </span>
              </a>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
