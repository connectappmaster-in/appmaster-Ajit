import { useState } from "react";
import { DepreciationDashboard } from "@/components/depreciation/DepreciationDashboard";
import { DepreciationFilters, DepreciationFilters as FiltersType } from "@/components/depreciation/DepreciationFilters";
import { DepreciationListView } from "@/components/depreciation/DepreciationListView";
import { useAssets } from "@/hooks/useAssets";
import { getYear } from "date-fns";

export default function Depreciation() {
  const { assets } = useAssets();
  const [filters, setFilters] = useState<FiltersType>({
    year: getYear(new Date()).toString(),
    actType: 'all',
    department: 'all',
    location: 'all',
    status: 'Active'
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Depreciation</h1>
        <p className="text-muted-foreground mt-2">
          View and calculate asset depreciation as per Companies Act and Income Tax Act
        </p>
      </div>

      <DepreciationDashboard assets={assets} />
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Depreciation Schedules</h2>
          <DepreciationFilters 
            assets={assets} 
            onFiltersChange={setFilters}
          />
        </div>
        
        <DepreciationListView 
          assets={assets}
          filters={filters}
        />
      </div>
    </div>
  );
}