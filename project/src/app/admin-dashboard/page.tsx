'use client';

import { useState, useEffect } from 'react';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { SiteHeader } from "./components/site-header";
import { DashboardOverview } from "./components/dashboard-overview";
import { LiveData } from "./components/live-data";
import { ShipmentManagement } from "./components/shipment-management";
import { AIIntelligence } from "./components/ai-intelligence";
import { RiskManagement } from "./components/risk-management";
import { ProductManagement } from "./components/product-management";
import { Analytics } from "./components/analytics";
import { Settings } from "./components/settings";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export type DashboardSection = 
  | 'overview' 
  | 'live-data'
  | 'shipments' 
  | 'ai-intelligence' 
  | 'risk-management' 
  | 'products' 
  | 'analytics' 
  | 'settings';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [dataType, setDataType] = useState<string>('overview');

  useEffect(() => {
    // Listen for section change events from data history
    const handleSectionChange = (event: any) => {
      console.log('Section change event received:', event.detail);
      const { section, dataType: newDataType } = event.detail;
      setActiveSection(section as DashboardSection);
      if (newDataType) {
        setDataType(newDataType);
      }
    };

    window.addEventListener('changeSection', handleSectionChange);
    
    return () => {
      window.removeEventListener('changeSection', handleSectionChange);
    };
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <DashboardOverview />;
      case 'live-data':
        return <LiveData initialDataType={dataType} />;
      case 'shipments':
        return <ShipmentManagement />;
      case 'ai-intelligence':
        return <AIIntelligence />;
      case 'risk-management':
        return <RiskManagement />;
      case 'products':
        return <ProductManagement />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <ProtectedRoute>
      <SidebarProvider
        className="min-h-screen bg-gray-50 dark:bg-gray-900"
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 12 + 1px)"
          } as React.CSSProperties
        }>
        <AppSidebar 
          variant="sidebar" 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 mx-10">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600 dark:text-gray-400">Loading...</span>
                    </div>
                  </div>
                ) : (
                  renderSection()
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
