import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";


export function SiteHeader() {
  return (
    <header className="bg-background/90 sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <h1 className="text-base font-medium">Shipment Management</h1>
        
        <div className="flex items-center gap-2">
          <Link href="/admin-dashboard/data-onboarding">
            <Button variant="default" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
