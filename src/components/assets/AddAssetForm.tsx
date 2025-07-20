import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAssets } from "@/hooks/useAssets";
import { AssetFormData, Asset } from "@/types/asset";
import { ArrowLeft, Save } from "lucide-react";

interface AddAssetFormProps {
  asset?: Asset;
  onSave?: (asset: Asset) => void;
}

const initialFormData: AssetFormData = {
  name: "",
  purchaseDate: "",
  capitalizationDate: "",
  purchaseValue: "",
  location: "",
  department: "",
  status: "Active",
  disposalDate: "",
  disposalValue: "",
  categoryName: "",
  usedFor: [],
  usefulLifeYears: "",
  residualValuePercent: 5,
  depreciationMethod: "SLM",
  depreciationRatePercent: "",
};

export function AddAssetForm({ asset, onSave }: AddAssetFormProps) {
  const [formData, setFormData] = useState<AssetFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addAsset, updateAsset, loading } = useAssets();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        purchaseDate: asset.purchaseDate,
        capitalizationDate: asset.capitalizationDate,
        purchaseValue: asset.purchaseValue,
        location: asset.location,
        department: asset.department,
        status: asset.status,
        disposalDate: asset.disposalDate || "",
        disposalValue: asset.disposalValue || "",
        categoryName: asset.categoryName,
        usedFor: asset.usedFor,
        usefulLifeYears: asset.usefulLifeYears || "",
        residualValuePercent: asset.residualValuePercent || 5,
        depreciationMethod: asset.depreciationMethod || "SLM",
        depreciationRatePercent: asset.depreciationRatePercent || "",
      });
    }
  }, [asset]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Asset name is required";
    if (!formData.purchaseDate) newErrors.purchaseDate = "Purchase date is required";
    if (!formData.capitalizationDate) newErrors.capitalizationDate = "Capitalization date is required";
    if (!formData.purchaseValue || Number(formData.purchaseValue) <= 0) {
      newErrors.purchaseValue = "Purchase value must be greater than 0";
    }
    if (!formData.categoryName.trim()) newErrors.categoryName = "Category name is required";
    if (formData.usedFor.length === 0) newErrors.usedFor = "Select at least one depreciation act";

    if (formData.usedFor.includes("Companies Act")) {
      if (!formData.usefulLifeYears || Number(formData.usefulLifeYears) <= 0) {
        newErrors.usefulLifeYears = "Useful life is required for Companies Act";
      }
    }

    if (formData.usedFor.includes("IT Act")) {
      if (!formData.depreciationRatePercent || Number(formData.depreciationRatePercent) <= 0) {
        newErrors.depreciationRatePercent = "Depreciation rate is required for IT Act";
      }
    }

    if (formData.status === "Disposed" && !formData.disposalDate) {
      newErrors.disposalDate = "Disposal date is required for disposed assets";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      let savedAsset: Asset;
      
      if (asset) {
        savedAsset = await updateAsset(asset.id, formData);
        if (!savedAsset) throw new Error("Failed to update asset");
        toast({
          title: "Asset Updated",
          description: "Asset has been updated successfully",
        });
      } else {
        savedAsset = await addAsset(formData);
        toast({
          title: "Asset Added",
          description: "Asset has been added successfully with depreciation calculated",
        });
      }

      if (onSave) {
        onSave(savedAsset);
      } else {
        navigate(`/assets/${savedAsset.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save asset",
        variant: "destructive",
      });
    }
  };

  const handleUsedForChange = (act: "Companies Act" | "IT Act", checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      usedFor: checked 
        ? [...prev.usedFor, act]
        : prev.usedFor.filter(item => item !== act)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">
          {asset ? "Edit Asset" : "Add New Asset"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="categoryName">Asset Category *</Label>
                <Input
                  id="categoryName"
                  value={formData.categoryName}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryName: e.target.value }))}
                  className={errors.categoryName ? "border-destructive" : ""}
                />
                {errors.categoryName && <p className="text-sm text-destructive mt-1">{errors.categoryName}</p>}
              </div>

              <div>
                <Label htmlFor="purchaseDate">Purchase Date *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className={errors.purchaseDate ? "border-destructive" : ""}
                />
                {errors.purchaseDate && <p className="text-sm text-destructive mt-1">{errors.purchaseDate}</p>}
              </div>

              <div>
                <Label htmlFor="capitalizationDate">Capitalization Date *</Label>
                <Input
                  id="capitalizationDate"
                  type="date"
                  value={formData.capitalizationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, capitalizationDate: e.target.value }))}
                  className={errors.capitalizationDate ? "border-destructive" : ""}
                />
                {errors.capitalizationDate && <p className="text-sm text-destructive mt-1">{errors.capitalizationDate}</p>}
              </div>

              <div>
                <Label htmlFor="purchaseValue">Purchase Value (₹) *</Label>
                <Input
                  id="purchaseValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.purchaseValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseValue: e.target.value as any }))}
                  className={errors.purchaseValue ? "border-destructive" : ""}
                />
                {errors.purchaseValue && <p className="text-sm text-destructive mt-1">{errors.purchaseValue}</p>}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: "Active" | "Disposed") => 
                  setFormData(prev => ({ ...prev, status: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Disposed">Disposed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>

            {formData.status === "Disposed" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label htmlFor="disposalDate">Disposal Date *</Label>
                  <Input
                    id="disposalDate"
                    type="date"
                    value={formData.disposalDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, disposalDate: e.target.value }))}
                    className={errors.disposalDate ? "border-destructive" : ""}
                  />
                  {errors.disposalDate && <p className="text-sm text-destructive mt-1">{errors.disposalDate}</p>}
                </div>

                <div>
                  <Label htmlFor="disposalValue">Disposal Value (₹)</Label>
                  <Input
                    id="disposalValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.disposalValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, disposalValue: e.target.value as any }))}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Depreciation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Depreciation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Used For *</Label>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="companiesAct"
                    checked={formData.usedFor.includes("Companies Act")}
                    onCheckedChange={(checked) => handleUsedForChange("Companies Act", !!checked)}
                  />
                  <Label htmlFor="companiesAct">Companies Act</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="itAct"
                    checked={formData.usedFor.includes("IT Act")}
                    onCheckedChange={(checked) => handleUsedForChange("IT Act", !!checked)}
                  />
                  <Label htmlFor="itAct">IT Act</Label>
                </div>
              </div>
              {errors.usedFor && <p className="text-sm text-destructive mt-1">{errors.usedFor}</p>}
            </div>

            {formData.usedFor.includes("Companies Act") && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="usefulLifeYears">Useful Life (Years) *</Label>
                  <Input
                    id="usefulLifeYears"
                    type="number"
                    min="1"
                    value={formData.usefulLifeYears}
                    onChange={(e) => setFormData(prev => ({ ...prev, usefulLifeYears: e.target.value as any }))}
                    className={errors.usefulLifeYears ? "border-destructive" : ""}
                  />
                  {errors.usefulLifeYears && <p className="text-sm text-destructive mt-1">{errors.usefulLifeYears}</p>}
                </div>

                <div>
                  <Label htmlFor="residualValuePercent">Residual Value (%)</Label>
                  <Input
                    id="residualValuePercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.residualValuePercent}
                    onChange={(e) => setFormData(prev => ({ ...prev, residualValuePercent: e.target.value as any }))}
                  />
                </div>

                <div>
                  <Label htmlFor="depreciationMethod">Depreciation Method</Label>
                  <Select 
                    value={formData.depreciationMethod} 
                    onValueChange={(value: "SLM" | "WDV") => 
                      setFormData(prev => ({ ...prev, depreciationMethod: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SLM">Straight Line Method</SelectItem>
                      <SelectItem value="WDV">Written Down Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.usedFor.includes("IT Act") && (
              <div className="p-4 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="depreciationRatePercent">Depreciation Rate (%) *</Label>
                  <Input
                    id="depreciationRatePercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.depreciationRatePercent}
                    onChange={(e) => setFormData(prev => ({ ...prev, depreciationRatePercent: e.target.value as any }))}
                    className={`max-w-xs ${errors.depreciationRatePercent ? "border-destructive" : ""}`}
                  />
                  {errors.depreciationRatePercent && <p className="text-sm text-destructive mt-1">{errors.depreciationRatePercent}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : asset ? "Update Asset" : "Save Asset"}
          </Button>
        </div>
      </form>
    </div>
  );
}