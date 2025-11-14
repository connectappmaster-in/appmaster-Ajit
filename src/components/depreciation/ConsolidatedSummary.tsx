import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileSpreadsheet, BarChart3 } from "lucide-react";
import { useAssets, useDeleteAsset } from "@/hooks/useAssets";
import { useDepreciationSchedules } from "@/hooks/useDepreciationSchedules";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConsolidatedSummaryProps {
  onAddNewAsset: () => void;
  currencySymbol?: string;
}

export const ConsolidatedSummary = ({
  onAddNewAsset,
  currencySymbol = "₹",
}: ConsolidatedSummaryProps) => {
  const { data: assets, isLoading } = useAssets();
  const deleteAsset = useDeleteAsset();
  const [filterLaw, setFilterLaw] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    if (filterLaw === "all") return assets;
    return assets.filter((asset) => asset.applicable_law === filterLaw);
  }, [assets, filterLaw]);

  const totals = useMemo(() => {
    if (!filteredAssets.length) return { totalCost: 0, totalDepreciation: 0 };

    const totalCost = filteredAssets.reduce((sum, asset) => sum + asset.original_cost, 0);
    
    // For simplicity, calculate first year depreciation
    const totalDepreciation = filteredAssets.reduce((sum, asset) => {
      const rate = asset.depreciation_rate / 100;
      let depreciation = 0;

      if (asset.depreciation_method === "SLM") {
        const salvage = (asset.original_cost * asset.residual_value_pct) / 100;
        depreciation = (asset.original_cost - salvage) / asset.useful_life;
      } else {
        depreciation = asset.original_cost * rate;
      }

      const multiShiftMultiplier = asset.multi_shift_use === 2 ? 1.5 : asset.multi_shift_use === 3 ? 2 : 1;
      return sum + (depreciation * multiShiftMultiplier);
    }, 0);

    return { totalCost, totalDepreciation };
  }, [filteredAssets]);

  const formatCurrency = (value: number) => {
    return `${currencySymbol} ${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleDeleteClick = (assetId: string) => {
    setAssetToDelete(assetId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (assetToDelete) {
      deleteAsset.mutate(assetToDelete);
    }
    setDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  const getRemainingLife = (asset: any) => {
    const purchaseDate = new Date(asset.purchase_date);
    const currentDate = new Date();
    const yearsElapsed = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const remaining = Math.max(0, asset.useful_life - Math.floor(yearsElapsed));
    return remaining;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Consolidated Asset Summary</h2>
        <Button onClick={onAddNewAsset}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Asset
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{filteredAssets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Asset Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totals.totalCost)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Annual Depreciation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totals.totalDepreciation)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by Law:</label>
        <Select value={filterLaw} onValueChange={setFilterLaw}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Companies Act">Companies Act</SelectItem>
            <SelectItem value="Income Tax Act">Income Tax Act</SelectItem>
            <SelectItem value="Both">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Assets</CardTitle>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No assets found</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first asset to track depreciation
              </p>
              <Button onClick={onAddNewAsset}>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Applicable Law</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Original Cost</TableHead>
                    <TableHead className="text-right">Current Year Dep.</TableHead>
                    <TableHead className="text-right">Rate %</TableHead>
                    <TableHead className="text-center">Remaining Life</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const rate = asset.depreciation_rate / 100;
                    let currentYearDep = 0;

                    if (asset.depreciation_method === "SLM") {
                      const salvage = (asset.original_cost * asset.residual_value_pct) / 100;
                      currentYearDep = (asset.original_cost - salvage) / asset.useful_life;
                    } else {
                      currentYearDep = asset.original_cost * rate;
                    }

                    const multiShiftMultiplier = asset.multi_shift_use === 2 ? 1.5 : asset.multi_shift_use === 3 ? 2 : 1;
                    currentYearDep *= multiShiftMultiplier;

                    return (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.asset_name}</TableCell>
                        <TableCell>{asset.asset_category}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.applicable_law}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={asset.depreciation_method === "SLM" ? "default" : "secondary"}>
                            {asset.depreciation_method}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(asset.original_cost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(currentYearDep)}
                        </TableCell>
                        <TableCell className="text-right">{asset.depreciation_rate}%</TableCell>
                        <TableCell className="text-center">
                          {getRemainingLife(asset)} years
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(asset.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset and all its
              depreciation schedules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
