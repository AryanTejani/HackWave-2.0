"use client";

import * as React from "react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { DashboardSection } from "../page";

interface NavMainProps {
  items: Array<{
    title: string;
    section?: DashboardSection;
    url?: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
  }>;
  activeSection?: DashboardSection;
  onSectionChange?: (section: DashboardSection) => void;
}

export function NavMain({ items, activeSection, onSectionChange }: NavMainProps) {
  return (
    <SidebarMenu>
      {items.map((item, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton
            asChild
            isActive={activeSection === item.section}
            className="data-[slot=sidebar-menu-button]:!p-3"
          >
            <button
              onClick={() => item.section && onSectionChange?.(item.section)}
              className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <item.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.description}
                  </div>
                )}
              </div>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
