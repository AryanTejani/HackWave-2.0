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
  isCollapsed?: boolean;
}

export function NavMain({ items, activeSection, onSectionChange, isCollapsed }: NavMainProps) {
  return (
    <SidebarMenu>
      {items.map((item, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton
            asChild
            isActive={activeSection === item.section}
            className={`data-[slot=sidebar-menu-button]:!p-3 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <button
              onClick={() => item.section && onSectionChange?.(item.section)}
              className={`w-full text-left flex items-center rounded-lg transition-all duration-200 group ${
                isCollapsed 
                  ? 'p-2 justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                  : 'p-3 space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${
                activeSection === item.section 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                  : 'hover:border-l-4 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <item.icon className={`h-5 w-5 transition-colors ${
                activeSection === item.section 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`} />
              {!isCollapsed && (
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
              )}
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
