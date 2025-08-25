"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Truck,
  Brain,
  AlertTriangle,
  Package,
  BarChart3,
  Settings,
  Search,
  HelpCircle,
  Cloud,
  Users,
  Database,
  FileText,
  MapIcon,
  ChevronLeft,
  ChevronRight,
  Building2,
  Warehouse,
  Store
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { DashboardSection } from "../page";
import  Map  from "./map";      

const data = {
  user: {
    name: "Admin User",
    email: "admin@hackwave.com",
    avatar: "/avatars/admin.jpg"
  },
  navMain: [
    {
      title: "Dashboard Overview",
      section: "overview" as DashboardSection,
      icon: LayoutDashboard,
      description: "Key metrics and insights"
    },
    {
      title: "Live Data",
      section: "live-data" as DashboardSection,
      icon: Database,
      description: "View and download uploaded data"
    },
    {
      title: "Shipment Management",
      section: "shipments" as DashboardSection,
      icon: Truck,
      description: "Track and manage shipments"
    },
    {
      title: "AI Intelligence",
      section: "ai-intelligence" as DashboardSection,
      icon: Brain,
      description: "AI-powered analysis and simulations"
    },
    {
      title: "Risk Management",
      section: "risk-management" as DashboardSection,
      icon: AlertTriangle,
      description: "Monitor and manage risks"
    },
    {
      title: "Product Management",
      section: "products" as DashboardSection,
      icon: Package,
      description: "Manage products and suppliers"
    },
    {
      title: "Analytics & Reports",
      section: "analytics" as DashboardSection,
      icon: BarChart3,
      description: "Advanced analytics and reporting"
    },
    {
      title: "Map",
      section: "map" as DashboardSection,
      icon: MapIcon,
      description: "Map of the world"
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      section: "settings" as DashboardSection,
      icon: Settings
    },
    {
      title: "Search",
      url: "#",
      icon: Search
    },
    {
      title: "Help & Support",
      url: "#",
      icon: HelpCircle
    }
  ]
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection?: DashboardSection;
  onSectionChange?: (section: DashboardSection) => void;
}

export function AppSidebar({ activeSection, onSectionChange, ...props }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Sidebar 
      collapsible={isCollapsed ? "icon" : "none"} 
      className={`h-screen border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`} 
      {...props}
    >
      {/* <SidebarHeader className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-3">
              <Link href="#" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-200">
                  <Cloud className="h-5 w-5 text-white" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      HackWave
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      Supply Chain
                    </span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader> */}
      
      <SidebarContent className="flex-1 py-4">
        <div className="px-3 mb-6">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Main Navigation
            </h3>
          )}
        </div>
        <NavMain 
          items={data.navMain} 
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          isCollapsed={isCollapsed}
        />
        
        <div className="px-3 mt-8 mb-4">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Tools & Support
            </h3>
          )}
        </div>
        <NavSecondary 
          items={data.navSecondary} 
          className="mb-4"
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          isCollapsed={isCollapsed}
        />
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <NavUser user={data.user} isCollapsed={isCollapsed} />
        
        {/* Collapse Toggle Button */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className="w-full h-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            )}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
