"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconDashboard,
  IconTruck,
  IconBrain,
  IconAlertTriangle,
  IconPackage,
  IconChartBar,
  IconSettings,
  IconSearch,
  IconHelp,
  IconInnerShadowTop,
  IconUsers,
  IconDatabase,
  IconReport,
  IconFileAi
} from "@tabler/icons-react";

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
      icon: IconDashboard,
      description: "Key metrics and insights"
    },
    {
      title: "Shipment Management",
      section: "shipments" as DashboardSection,
      icon: IconTruck,
      description: "Track and manage shipments"
    },
    {
      title: "AI Intelligence",
      section: "ai-intelligence" as DashboardSection,
      icon: IconBrain,
      description: "AI-powered analysis and simulations"
    },
    {
      title: "Risk Management",
      section: "risk-management" as DashboardSection,
      icon: IconAlertTriangle,
      description: "Monitor and manage risks"
    },
    {
      title: "Product Management",
      section: "products" as DashboardSection,
      icon: IconPackage,
      description: "Manage products and suppliers"
    },
    {
      title: "Analytics & Reports",
      section: "analytics" as DashboardSection,
      icon: IconChartBar,
      description: "Advanced analytics and reporting"
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      section: "settings" as DashboardSection,
      icon: IconSettings
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch
    },
    {
      title: "Help & Support",
      url: "#",
      icon: IconHelp
    }
  ]
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSection?: DashboardSection;
  onSectionChange?: (section: DashboardSection) => void;
}

export function AppSidebar({ activeSection, onSectionChange, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="none" className="h-screen border-r border-gray-200 dark:border-gray-700" {...props}>
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="#">
                <IconInnerShadowTop className="!size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-base font-semibold text-gray-900 dark:text-white">HackWave Supply Chain</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain 
          items={data.navMain} 
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
        <NavSecondary 
          items={data.navSecondary} 
          className="mt-auto"
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
