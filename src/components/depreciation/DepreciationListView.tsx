import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Asset } from '@/types/asset';
import { DepreciationFilters } from '@/components/depreciation/DepreciationFilters';
import { calculateDepreciation } from '@/lib/depreciation';
import { formatCurrency } from '@/lib/depreciation';
import { Download, Calculator } from 'lucide-react';

interface DepreciationListViewProps {
  assets: Asset[];
  filters: any;
}

export function DepreciationListView({ assets, filters }: DepreciationListViewProps) {
  const { toast } = useToast();

  // Filter assets based on provided filters
  const filteredAssets = assets.filter(asset => {
    if (filters.status !== 'all' && asset.status !== filters.status) return false;
    if (filters.department !== 'all' && asset.department !== filters.department) return false;
    if (filters.location !== 'all' && asset.location !== filters.location) return false;
    return true;
  });

  // Calculate depreciation schedules
  const depreciationData = filteredAssets.map(asset => {
    const schedule = calculateDepreciation(asset);
    return { asset, schedule };
  });

  // Separate by act type
  const companiesActData = depreciationData.filter(item => 
    item.asset.usedFor.includes('Companies Act')
  );
  
  const itActData = depreciationData.filter(item => 
    item.asset.usedFor.includes('IT Act')
  );

  const exportToCSV = (data: any[], actType: string) => {
    if (data.length === 0) {
      toast({
        title: "No Data",
        description: "No depreciation data available for export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Asset/Block', 'FY', 'Opening WDV', 'Depreciation', 'Closing WDV'];
    const csvData: any[] = [];

    data.forEach(({ asset, schedule }) => {
      schedule.entries.forEach(entry => {
        csvData.push([
          asset.name,
          entry.year,
          entry.openingValue,
          entry.depreciation,
          entry.closingValue
        ]);
      });
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `depreciation-${actType.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `${actType} depreciation schedule exported successfully.`,
    });
  };

  const renderDepreciationTable = (data: any[], actType: string) => {
    if (data.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No assets found for {actType} depreciation with current filters.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {actType} Depreciation Schedule
            </CardTitle>
            <Button onClick={() => exportToCSV(data, actType)} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset/Block</TableHead>
                <TableHead>Financial Year</TableHead>
                <TableHead className="text-right">Opening WDV</TableHead>
                <TableHead className="text-right">Depreciation</TableHead>
                <TableHead className="text-right">Closing WDV</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(({ asset, schedule }) => (
                schedule.entries.map((entry, index) => (
                  <TableRow key={`${asset.id}-${index}`}>
                    <TableCell className="font-medium">
                      {index === 0 ? asset.name : ''}
                    </TableCell>
                    <TableCell>
                      FY {entry.year}-{(entry.year + 1).toString().slice(-2)}
                      {entry.isProRata && (
                        <Badge variant="outline" className="ml-2 text-xs">Pro-rata</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.openingValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.depreciation)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.closingValue)}
                    </TableCell>
                    <TableCell>
                      {index === 0 ? (asset.depreciationMethod || 'SLM') : ''}
                    </TableCell>
                    <TableCell>
                      {index === 0 ? `${asset.depreciationRatePercent || 0}%` : ''}
                    </TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Depreciation Schedule List View</h3>
          <p className="text-sm text-muted-foreground">
            Year-wise depreciation breakdown for all assets
          </p>
        </div>
      </div>

      <Tabs defaultValue="companies-act" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies-act">
            Companies Act ({companiesActData.length} assets)
          </TabsTrigger>
          <TabsTrigger value="it-act">
            IT Act ({itActData.length} assets)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies-act" className="space-y-4">
          {renderDepreciationTable(companiesActData, 'Companies Act')}
        </TabsContent>

        <TabsContent value="it-act" className="space-y-4">
          {renderDepreciationTable(itActData, 'IT Act')}
        </TabsContent>
      </Tabs>
    </div>
  );
}