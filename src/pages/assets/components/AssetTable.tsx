import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

interface Asset {
  id: string;
  asset_name: string;
  applicable_law: string;
  asset_category: string;
  original_cost: number;
  depreciation_method: string;
  depreciation_rate: number;
  purchase_date: string;
  useful_life: number;
}

interface AssetTableProps {
  assets: Asset[];
  onRefresh: () => void;
  onEdit: (asset: Asset) => void;
}

export default function AssetTable({ assets, onRefresh, onEdit }: AssetTableProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [lawFilter, setLawFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.asset_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLaw = lawFilter === "all" || asset.applicable_law === lawFilter;
    const matchesCategory = categoryFilter === "all" || asset.asset_category === categoryFilter;
    return matchesSearch && matchesLaw && matchesCategory;
  });

  const handleDelete = async () => {
    if (!deleteAssetId) return;

    try {
      const { error } = await (supabase as any).from("assets").delete().eq("id", deleteAssetId);

      if (error) throw error;

      toast.success("Asset deleted successfully");
      onRefresh();
    } catch (error: any) {
      console.error("Error deleting asset:", error);
      toast.error(error.message || "Failed to delete asset");
    } finally {
      setDeleteAssetId(null);
    }
  };

  const handleViewDepreciation = (assetId: string) => {
    navigate(`/depreciation?asset=${assetId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLaw = (law: string) => {
    return law === "companies_act" ? "Companies Act" : "Income Tax Act";
  };

  const categories = Array.from(new Set(assets.map((a) => a.asset_category)));

  return (
    <>
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Asset List</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={lawFilter} onValueChange={setLawFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by law" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Laws</SelectItem>
                <SelectItem value="companies_act">Companies Act</SelectItem>
                <SelectItem value="income_tax_act">Income Tax Act</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Law</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Rate (%)</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No assets found. Add your first asset to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssets.map((asset) => (
                    <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{asset.asset_name}</TableCell>
                      <TableCell>{formatLaw(asset.applicable_law)}</TableCell>
                      <TableCell>{asset.asset_category}</TableCell>
                      <TableCell>{formatCurrency(asset.original_cost)}</TableCell>
                      <TableCell>{asset.depreciation_method}</TableCell>
                      <TableCell>{asset.depreciation_rate}%</TableCell>
                      <TableCell>{new Date(asset.purchase_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDepreciation(asset.id)}
                            title="View Depreciation"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(asset)}
                            title="Edit Asset"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteAssetId(asset.id)}
                            title="Delete Asset"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteAssetId} onOpenChange={() => setDeleteAssetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset and all associated depreciation schedules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
