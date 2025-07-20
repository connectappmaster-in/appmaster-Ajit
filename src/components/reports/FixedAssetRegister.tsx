import { useState, useMemo } from 'react';
import { Asset } from '@/types/asset';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileSpreadsheet } from 'lucide-react';
import { ReportFilters, ReportFilters as Filters } from './ReportFilters';
import { formatCurrency } from '@/lib/depreciation';
import { format } from 'date-fns';

interface FixedAssetRegisterProps {
  assets: Asset[];
}

export function FixedAssetRegister({ assets }: FixedAssetRegisterProps) {
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

  // Filter assets based on current filters
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Date range filter
      if (filters.dateFrom) {
        const assetDate = new Date(asset.purchaseDate);
        if (assetDate < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        const assetDate = new Date(asset.purchaseDate);
        if (assetDate > filters.dateTo) return false;
      }

      // Department filter
      if (filters.department && asset.department !== filters.department) {
        return false;
      }

      // Location filter
      if (filters.location && asset.location !== filters.location) {
        return false;
      }

      // Status filter
      if (filters.status && asset.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [assets, filters]);

  const exportToCSV = () => {
    const headers = [
      'Asset Name',
      'Purchase Date',
      'Purchase Value',
      'Location',
      'Department',
      'Category',
      'Status',
      'Serial/Tag No.'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAssets.map(asset => [
        `"${asset.name}"`,
        asset.purchaseDate,
        asset.purchaseValue,
        `"${asset.location}"`,
        `"${asset.department}"`,
        `"${asset.categoryName}"`,
        asset.status,
        `"${asset.id}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fixed-asset-register-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        showDateRange={true}
        showDepartment={true}
        showLocation={true}
        showStatus={true}
        departments={departments}
        locations={locations}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Fixed Asset Register</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredAssets.length} of {assets.length} assets
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead className="text-right">Purchase Value</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Serial/Tag No.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No assets found matching the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell>{format(new Date(asset.purchaseDate), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(asset.purchaseValue)}</TableCell>
                      <TableCell>{asset.location}</TableCell>
                      <TableCell>{asset.department}</TableCell>
                      <TableCell>{asset.categoryName}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          asset.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {asset.status}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{asset.id}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}