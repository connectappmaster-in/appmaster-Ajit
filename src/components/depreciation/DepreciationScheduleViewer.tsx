import { useState } from "react";
import { Asset, DepreciationSchedule } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, calculateDepreciation } from "@/lib/depreciation";
import { DepreciationFilters } from "./DepreciationFilters";
import { Download, FileText, Table as TableIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DepreciationScheduleViewerProps {
  assets: Asset[];
  filters: DepreciationFilters;
}

export function DepreciationScheduleViewer({ assets, filters }: DepreciationScheduleViewerProps) {
  const [selectedTab, setSelectedTab] = useState<'companies' | 'it'>('companies');
  
  // Filter assets based on current filters
  const filteredAssets = assets.filter(asset => {
    if (filters.status !== 'all' && asset.status !== filters.status) return false;
    if (filters.department !== 'all' && asset.department !== filters.department) return false;
    if (filters.location !== 'all' && asset.location !== filters.location) return false;
    
    // Filter by act type
    if (filters.actType === 'Companies Act' && !asset.usedFor.includes('Companies Act')) return false;
    if (filters.actType === 'IT Act' && !asset.usedFor.includes('IT Act')) return false;
    
    return true;
  });

  // Group schedules by act type
  const companiesActSchedules: Array<{ asset: Asset; schedule: DepreciationSchedule }> = [];
  const itActSchedules: Array<{ asset: Asset; schedule: DepreciationSchedule }> = [];

  filteredAssets.forEach(asset => {
    const schedules = calculateDepreciation(asset);
    
    schedules.forEach(schedule => {
      if (schedule.type === 'Companies Act') {
        companiesActSchedules.push({ asset, schedule });
      } else if (schedule.type === 'IT Act') {
        itActSchedules.push({ asset, schedule });
      }
    });
  });

  const exportToCSV = (schedules: Array<{ asset: Asset; schedule: DepreciationSchedule }>, actType: string) => {
    if (schedules.length === 0) {
      toast({
        title: "No Data",
        description: "No depreciation schedules to export",
        variant: "destructive"
      });
      return;
    }

    const headers = ["Asset Name", "Year", "Opening Value", "Depreciation", "Closing Value", "Method"];
    const rows: string[][] = [];

    schedules.forEach(({ asset, schedule }) => {
      schedule.entries.forEach(entry => {
        rows.push([
          asset.name,
          entry.year.toString(),
          entry.openingValue.toFixed(2),
          entry.depreciation.toFixed(2),
          entry.closingValue.toFixed(2),
          asset.depreciationMethod || schedule.type
        ]);
      });
    });

    const csvContent = [
      [`Depreciation Schedule - ${actType}`, '', '', '', '', ''],
      [`Generated on: ${new Date().toLocaleDateString()}`, '', '', '', '', ''],
      ['', '', '', '', '', ''],
      headers,
      ...rows
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `depreciation-schedule-${actType.toLowerCase().replace(" ", "-")}-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Depreciation schedule exported for ${actType}`,
    });
  };

  const renderScheduleTable = (schedules: Array<{ asset: Asset; schedule: DepreciationSchedule }>) => {
    if (schedules.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <TableIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No depreciation schedules found for the selected filters.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {schedules.map(({ asset, schedule }, index) => (
          <Card key={`${asset.id}-${index}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {asset.department} • {asset.location} • {asset.categoryName}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    {schedule.type}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Total Depreciation: {formatCurrency(schedule.totalDepreciation)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current WDV: {formatCurrency(schedule.currentWDV)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-sm">Year</th>
                      <th className="text-right py-2 px-3 font-medium text-sm">Opening Value</th>
                      <th className="text-right py-2 px-3 font-medium text-sm">Depreciation</th>
                      <th className="text-right py-2 px-3 font-medium text-sm">Closing Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.entries.map((entry, entryIndex) => (
                      <tr key={entry.year} className={entryIndex % 2 === 0 ? "bg-muted/50" : ""}>
                        <td className="py-2 px-3 text-sm">
                          <div className="flex items-center gap-2">
                            {entry.year}
                            {entry.isProRata && (
                              <Badge variant="secondary" className="text-xs">
                                Pro-rata
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-sm text-right font-mono">
                          {formatCurrency(entry.openingValue)}
                        </td>
                        <td className="py-2 px-3 text-sm text-right font-mono text-destructive">
                          {formatCurrency(entry.depreciation)}
                        </td>
                        <td className="py-2 px-3 text-sm text-right font-mono font-medium">
                          {formatCurrency(entry.closingValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'companies' | 'it')}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="companies">
              Companies Act ({companiesActSchedules.length})
            </TabsTrigger>
            <TabsTrigger value="it">
              IT Act ({itActSchedules.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportToCSV(
                selectedTab === 'companies' ? companiesActSchedules : itActSchedules,
                selectedTab === 'companies' ? 'Companies Act' : 'IT Act'
              )}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <TabsContent value="companies" className="space-y-4">
          {renderScheduleTable(companiesActSchedules)}
        </TabsContent>

        <TabsContent value="it" className="space-y-4">
          {renderScheduleTable(itActSchedules)}
        </TabsContent>
      </Tabs>
    </div>
  );
}