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
  isCollapsed?: boolean;
}

export function NavSecondary({ items, className, activeSection, onSectionChange, isCollapsed }: NavSecondaryProps) {
  return (
    <SidebarMenu className={className}>
      {items.map((item, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton
            asChild
            isActive={activeSection === item.section}
            className={`data-[slot=sidebar-menu-button]:!p-3 ${isCollapsed ? 'justify-center' : ''}`}
          >
            {item.section ? (
              <button
                onClick={() => onSectionChange?.(item.section!)}
                className={`w-full text-left flex items-center rounded-lg transition-all duration-200 group ${
                  isCollapsed 
                    ? 'p-2 justify-center hover:bg-gray-50 dark:hover:bg-gray-800' 
                    : 'p-3 space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                {!isCollapsed && (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </span>
                )}
              </button>
            ) : (
              <a
                href={item.url}
                className={`w-full text-left flex items-center rounded-lg transition-all duration-200 group ${
                  isCollapsed 
                    ? 'p-2 justify-center hover:bg-gray-50 dark:hover:bg-gray-800' 
                    : 'p-3 space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                {!isCollapsed && (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </span>
                )}
              </a>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
