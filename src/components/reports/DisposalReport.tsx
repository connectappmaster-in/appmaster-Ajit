import { useState, useMemo } from 'react';
import { Asset } from '@/types/asset';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSpreadsheet } from 'lucide-react';
import { ReportFilters, ReportFilters as Filters } from './ReportFilters';
import { formatCurrency, calculateDepreciation } from '@/lib/depreciation';
import { format } from 'date-fns';

interface DisposalReportProps {
  assets: Asset[];
}

export function DisposalReport({ assets }: DisposalReportProps) {
  const [filters, setFilters] = useState<ReportFilters>({});

  // Get unique departments and locations for filters
  const departments = useMemo(() => 
    Array.from(new Set(assets.map(a => a.department).filter(Boolean))), 
    [assets]
  );
  
  const locations = useMemo(() => 
    Array.from(new Set(assets.map(a => a.location).filter(Boolean))), 
    [assets]
  );

  // Filter disposed assets
  const disposedAssets = useMemo(() => {
    return assets.filter(asset => {
      // Only disposed assets
      if (asset.status !== 'Disposed' || !asset.disposalDate) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const disposalDate = new Date(asset.disposalDate);
        if (disposalDate < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        const disposalDate = new Date(asset.disposalDate);
        if (disposalDate > filters.dateTo) return false;
      }

      // Department filter
      if (filters.department && asset.department !== filters.department) {
        return false;
      }

      // Location filter
      if (filters.location && asset.location !== filters.location) {
        return false;
      }

      return true;
    });
  }, [assets, filters]);

  // Calculate disposal data with gain/loss
  const disposalData = useMemo(() => {
    return disposedAssets.map(asset => {
      const schedules = calculateDepreciation(asset);
      const companiesActSchedule = schedules.find(s => s.type === 'Companies Act');
      
      // Calculate WDV at disposal date
      const disposalYear = new Date(asset.disposalDate!).getFullYear();
      const wdvAtDisposal = companiesActSchedule?.entries.find(e => e.year <= disposalYear)?.closingValue || asset.purchaseValue;
      
      const disposalValue = asset.disposalValue || 0;
      const gainLoss = disposalValue - wdvAtDisposal;

      return {
        asset,
        wdvAtDisposal,
        disposalValue,
        gainLoss,
      };
    });
  }, [disposedAssets]);

  const exportToCSV = () => {
    const headers = [
      'Asset Name',
      'Disposal Date',
      'Purchase Value',
      'WDV at Disposal',
      'Disposal Value',
      'Gain/Loss',
      'Department',
      'Location'
    ];

    const csvContent = [
      headers.join(','),
      ...disposalData.map(item => [
        `"${item.asset.name}"`,
        item.asset.disposalDate,
        item.asset.purchaseValue,
        item.wdvAtDisposal,
        item.disposalValue,
        item.gainLoss,
        `"${item.asset.department}"`,
        `"${item.asset.location}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disposal-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate totals
  const totals = useMemo(() => {
    return disposalData.reduce((acc, item) => ({
      purchaseValue: acc.purchaseValue + item.asset.purchaseValue,
      wdvAtDisposal: acc.wdvAtDisposal + item.wdvAtDisposal,
      disposalValue: acc.disposalValue + item.disposalValue,
      gainLoss: acc.gainLoss + item.gainLoss,
    }), {
      purchaseValue: 0,
      wdvAtDisposal: 0,
      disposalValue: 0,
      gainLoss: 0,
    });
  }, [disposalData]);

  return (
    <div className="space-y-6">
      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        showDateRange={true}
        showDepartment={true}
        showLocation={true}
        departments={departments}
        locations={locations}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Asset Disposal Report</CardTitle>
            <Button variant="outline" onClick={exportToCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {disposalData.length} disposed assets
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Disposal Date</TableHead>
                  <TableHead className="text-right">Purchase Value</TableHead>
                  <TableHead className="text-right">WDV at Disposal</TableHead>
                  <TableHead className="text-right">Disposal Value</TableHead>
                  <TableHead className="text-right">Gain/Loss</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disposalData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No disposed assets found matching the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {disposalData.map((item) => (
                      <TableRow key={item.asset.id}>
                        <TableCell className="font-medium">{item.asset.name}</TableCell>
                        <TableCell>
                          {format(new Date(item.asset.disposalDate!), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.asset.purchaseValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.wdvAtDisposal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.disposalValue)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          item.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.gainLoss >= 0 ? '+' : ''}{formatCurrency(item.gainLoss)}
                        </TableCell>
                        <TableCell>{item.asset.department}</TableCell>
                        <TableCell>{item.asset.location}</TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Totals row */}
                    <TableRow className="bg-muted/50 font-medium">
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totals.purchaseValue)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totals.wdvAtDisposal)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totals.disposalValue)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${
                        totals.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {totals.gainLoss >= 0 ? '+' : ''}{formatCurrency(totals.gainLoss)}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}