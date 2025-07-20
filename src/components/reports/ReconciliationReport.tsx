import { useState, useMemo } from 'react';
import { Asset } from '@/types/asset';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSpreadsheet } from 'lucide-react';
import { ReportFilters, ReportFilters as Filters } from './ReportFilters';
import { formatCurrency, calculateDepreciation } from '@/lib/depreciation';
import { format } from 'date-fns';

interface ReconciliationReportProps {
  assets: Asset[];
}

export function ReconciliationReport({ assets }: ReconciliationReportProps) {
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

  // Filter assets that have both Companies Act and IT Act depreciation
  const reconciliationData = useMemo(() => {
    return assets
      .filter(asset => {
        // Only assets that use both acts
        if (!asset.usedFor.includes('Companies Act') || !asset.usedFor.includes('IT Act')) {
          return false;
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
      })
      .map(asset => {
        const schedules = calculateDepreciation(asset);
        const companiesActSchedule = schedules.find(s => s.type === 'Companies Act');
        const itActSchedule = schedules.find(s => s.type === 'IT Act');

        const companiesActWDV = companiesActSchedule?.currentWDV || 0;
        const itActWDV = itActSchedule?.currentWDV || 0;
        const difference = companiesActWDV - itActWDV;

        const companiesActDepreciation = companiesActSchedule?.totalDepreciation || 0;
        const itActDepreciation = itActSchedule?.totalDepreciation || 0;
        const depreciationDifference = companiesActDepreciation - itActDepreciation;

        return {
          asset,
          companiesActWDV,
          itActWDV,
          difference,
          companiesActDepreciation,
          itActDepreciation,
          depreciationDifference,
        };
      });
  }, [assets, filters]);

  const exportToCSV = () => {
    const headers = [
      'Asset Name',
      'Category',
      'Purchase Value',
      'Companies Act WDV',
      'IT Act WDV',
      'WDV Difference',
      'Companies Act Depreciation',
      'IT Act Depreciation',
      'Depreciation Difference',
      'Department',
      'Location'
    ];

    const csvContent = [
      headers.join(','),
      ...reconciliationData.map(item => [
        `"${item.asset.name}"`,
        `"${item.asset.categoryName}"`,
        item.asset.purchaseValue,
        item.companiesActWDV,
        item.itActWDV,
        item.difference,
        item.companiesActDepreciation,
        item.itActDepreciation,
        item.depreciationDifference,
        `"${item.asset.department}"`,
        `"${item.asset.location}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate totals
  const totals = useMemo(() => {
    return reconciliationData.reduce((acc, item) => ({
      purchaseValue: acc.purchaseValue + item.asset.purchaseValue,
      companiesActWDV: acc.companiesActWDV + item.companiesActWDV,
      itActWDV: acc.itActWDV + item.itActWDV,
      difference: acc.difference + item.difference,
      companiesActDepreciation: acc.companiesActDepreciation + item.companiesActDepreciation,
      itActDepreciation: acc.itActDepreciation + item.itActDepreciation,
      depreciationDifference: acc.depreciationDifference + item.depreciationDifference,
    }), {
      purchaseValue: 0,
      companiesActWDV: 0,
      itActWDV: 0,
      difference: 0,
      companiesActDepreciation: 0,
      itActDepreciation: 0,
      depreciationDifference: 0,
    });
  }, [reconciliationData]);

  return (
    <div className="space-y-6">
      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        showDateRange={false}
        showDepartment={true}
        showLocation={true}
        showYear={true}
        departments={departments}
        locations={locations}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Reconciliation Report - Companies Act vs IT Act</CardTitle>
            <Button variant="outline" onClick={exportToCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Comparing depreciation values between Companies Act and IT Act for {reconciliationData.length} assets
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Purchase Value</TableHead>
                  <TableHead className="text-right">Companies Act WDV</TableHead>
                  <TableHead className="text-right">IT Act WDV</TableHead>
                  <TableHead className="text-right">WDV Difference</TableHead>
                  <TableHead className="text-right">Companies Depreciation</TableHead>
                  <TableHead className="text-right">IT Depreciation</TableHead>
                  <TableHead className="text-right">Dep. Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliationData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No assets found that use both Companies Act and IT Act depreciation
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {reconciliationData.map((item) => (
                      <TableRow key={item.asset.id}>
                        <TableCell className="font-medium">{item.asset.name}</TableCell>
                        <TableCell>{item.asset.categoryName}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.asset.purchaseValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.companiesActWDV)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.itActWDV)}
                        </TableCell>
                        <TableCell className={`text-right ${
                          item.difference > 0 ? 'text-blue-600' : item.difference < 0 ? 'text-orange-600' : ''
                        }`}>
                          {item.difference !== 0 && (item.difference > 0 ? '+' : '')}{formatCurrency(item.difference)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.companiesActDepreciation)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.itActDepreciation)}
                        </TableCell>
                        <TableCell className={`text-right ${
                          item.depreciationDifference > 0 ? 'text-blue-600' : item.depreciationDifference < 0 ? 'text-orange-600' : ''
                        }`}>
                          {item.depreciationDifference !== 0 && (item.depreciationDifference > 0 ? '+' : '')}{formatCurrency(item.depreciationDifference)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Totals row */}
                    <TableRow className="bg-muted/50 font-medium border-t-2">
                      <TableCell className="font-bold" colSpan={2}>Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totals.purchaseValue)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totals.companiesActWDV)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totals.itActWDV)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${
                        totals.difference > 0 ? 'text-blue-600' : totals.difference < 0 ? 'text-orange-600' : ''
                      }`}>
                        {totals.difference !== 0 && (totals.difference > 0 ? '+' : '')}{formatCurrency(totals.difference)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totals.companiesActDepreciation)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(totals.itActDepreciation)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${
                        totals.depreciationDifference > 0 ? 'text-blue-600' : totals.depreciationDifference < 0 ? 'text-orange-600' : ''
                      }`}>
                        {totals.depreciationDifference !== 0 && (totals.depreciationDifference > 0 ? '+' : '')}{formatCurrency(totals.depreciationDifference)}
                      </TableCell>
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