import { useState, useMemo } from 'react';
import { Asset } from '@/types/asset';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet } from 'lucide-react';
import { ReportFilters, ReportFilters as Filters } from './ReportFilters';
import { formatCurrency, calculateDepreciation } from '@/lib/depreciation';
import { format } from 'date-fns';

interface DepreciationReportProps {
  assets: Asset[];
}

export function DepreciationReport({ assets }: DepreciationReportProps) {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [activeTab, setActiveTab] = useState('companies-act');

  // Get unique departments and locations for filters
  const departments = useMemo(() => 
    Array.from(new Set(assets.map(a => a.department).filter(Boolean))), 
    [assets]
  );
  
  const locations = useMemo(() => 
    Array.from(new Set(assets.map(a => a.location).filter(Boolean))), 
    [assets]
  );

  // Filter assets based on current filters
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Department filter
      if (filters.department && asset.department !== filters.department) {
        return false;
      }

      // Location filter
      if (filters.location && asset.location !== filters.location) {
        return false;
      }

      // Act type filter
      if (filters.actType && !asset.usedFor.includes(filters.actType as any)) {
        return false;
      }

      return true;
    });
  }, [assets, filters]);

  // Calculate depreciation data for filtered assets
  const depreciationData = useMemo(() => {
    return filteredAssets.map(asset => {
      const schedules = calculateDepreciation(asset);
      const companiesActSchedule = schedules.find(s => s.type === 'Companies Act');
      const itActSchedule = schedules.find(s => s.type === 'IT Act');

      return {
        asset,
        companiesActSchedule,
        itActSchedule,
      };
    });
  }, [filteredAssets]);

  const exportToCSV = (actType: 'Companies Act' | 'IT Act') => {
    const relevantData = depreciationData.filter(item => 
      actType === 'Companies Act' ? item.companiesActSchedule : item.itActSchedule
    );

    const headers = [
      'Asset Name',
      'Category',
      'Purchase Value',
      'Method/Rate',
      'Useful Life (Years)',
      'Current Year Depreciation',
      'Accumulated Depreciation',
      'Current WDV'
    ];

    const csvContent = [
      headers.join(','),
      ...relevantData.map(item => {
        const schedule = actType === 'Companies Act' ? item.companiesActSchedule : item.itActSchedule;
        const currentYear = new Date().getFullYear();
        const currentYearEntry = schedule?.entries.find(e => e.year === currentYear);
        
        return [
          `"${item.asset.name}"`,
          `"${item.asset.categoryName}"`,
          item.asset.purchaseValue,
          actType === 'Companies Act' 
            ? `"${item.asset.depreciationMethod}"` 
            : `"${item.asset.depreciationRatePercent}%"`,
          item.asset.usefulLifeYears || 'N/A',
          currentYearEntry?.depreciation || 0,
          schedule?.totalDepreciation || 0,
          schedule?.currentWDV || 0
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `depreciation-report-${actType.toLowerCase().replace(' ', '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const CompaniesActTable = () => {
    const companiesData = depreciationData.filter(item => item.companiesActSchedule);
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Purchase Value</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Useful Life</TableHead>
            <TableHead className="text-right">Current Depreciation</TableHead>
            <TableHead className="text-right">Accumulated Depreciation</TableHead>
            <TableHead className="text-right">Current WDV</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companiesData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No assets with Companies Act depreciation found
              </TableCell>
            </TableRow>
          ) : (
            companiesData.map((item) => {
              const currentYear = new Date().getFullYear();
              const currentYearEntry = item.companiesActSchedule?.entries.find(e => e.year === currentYear);
              
              return (
                <TableRow key={item.asset.id}>
                  <TableCell className="font-medium">{item.asset.name}</TableCell>
                  <TableCell>{item.asset.categoryName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.asset.purchaseValue)}</TableCell>
                  <TableCell>{item.asset.depreciationMethod}</TableCell>
                  <TableCell>{item.asset.usefulLifeYears} years</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(currentYearEntry?.depreciation || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.companiesActSchedule?.totalDepreciation || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.companiesActSchedule?.currentWDV || 0)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    );
  };

  const ITActTable = () => {
    const itData = depreciationData.filter(item => item.itActSchedule);
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Block/Category</TableHead>
            <TableHead className="text-right">Purchase Value</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead className="text-right">Current Depreciation</TableHead>
            <TableHead className="text-right">Accumulated Depreciation</TableHead>
            <TableHead className="text-right">Current WDV</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No assets with IT Act depreciation found
              </TableCell>
            </TableRow>
          ) : (
            itData.map((item) => {
              const currentYear = new Date().getFullYear();
              const currentYearEntry = item.itActSchedule?.entries.find(e => e.year === currentYear);
              
              return (
                <TableRow key={item.asset.id}>
                  <TableCell className="font-medium">{item.asset.name}</TableCell>
                  <TableCell>{item.asset.categoryName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.asset.purchaseValue)}</TableCell>
                  <TableCell>{item.asset.depreciationRatePercent}%</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(currentYearEntry?.depreciation || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.itActSchedule?.totalDepreciation || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.itActSchedule?.currentWDV || 0)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        showDateRange={false}
        showDepartment={true}
        showLocation={true}
        showActType={true}
        showYear={true}
        departments={departments}
        locations={locations}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Depreciation Schedules</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="companies-act">Companies Act</TabsTrigger>
                <TabsTrigger value="it-act">IT Act</TabsTrigger>
              </TabsList>
              
              <Button 
                variant="outline" 
                onClick={() => exportToCSV(activeTab === 'companies-act' ? 'Companies Act' : 'IT Act')}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <TabsContent value="companies-act">
              <div className="rounded-md border">
                <CompaniesActTable />
              </div>
            </TabsContent>

            <TabsContent value="it-act">
              <div className="rounded-md border">
                <ITActTable />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}