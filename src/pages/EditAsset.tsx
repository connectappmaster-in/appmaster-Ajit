import { useParams, useNavigate } from "react-router-dom";
import { AddAssetForm } from "@/components/assets/AddAssetForm";
import { useAssets } from "@/hooks/useAssets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditAsset() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAsset } = useAssets();

  if (!id) {
    navigate("/assets");
    return null;
  }

  const asset = getAsset(id);

  if (!asset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/assets")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Asset not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AddAssetForm 
      asset={asset} 
      onSave={(savedAsset) => navigate(`/assets/${savedAsset.id}`)}
    />
  );
}