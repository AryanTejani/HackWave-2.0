import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";


export function SiteHeader() {
  return (
    <header className="bg-background/90 sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex items-center gap-2">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-medium">Shipment Management</h1>
     <div className="flex items-center justify-end">
      <Link href="/admin-dashboard/upload-data">
      <Button className="">
        <Upload className="w-4 h-4" />
        Upload data
        </Button>
      </Link>
     </div>
      </div>
      </div>
     
    </header>
  );
}
