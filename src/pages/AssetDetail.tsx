import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAssets } from "@/hooks/useAssets";
import { DepreciationTable } from "@/components/assets/DepreciationTable";
import { formatCurrency } from "@/lib/depreciation";
import { ArrowLeft, Edit, Calculator } from "lucide-react";

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAsset, getDepreciationSchedules } = useAssets();

  if (!id) {
    navigate("/assets");
    return null;
  }

  const asset = getAsset(id);
  const schedules = getDepreciationSchedules(id);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/assets")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{asset.name}</h1>
            <p className="text-muted-foreground">{asset.categoryName}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link to={`/assets/${asset.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Asset
            </Button>
          </Link>
          <Badge variant={asset.status === "Active" ? "default" : "secondary"}>
            {asset.status}
          </Badge>
        </div>
      </div>

      {/* Asset Details */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Financial Details</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Purchase Value:</span>
                  <p className="font-medium">{formatCurrency(asset.purchaseValue)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Purchase Date:</span>
                  <p className="font-medium">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Capitalization Date:</span>
                  <p className="font-medium">{new Date(asset.capitalizationDate).toLocaleDateString()}</p>
                </div>
                {asset.status === "Disposed" && (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground">Disposal Date:</span>
                      <p className="font-medium">
                        {asset.disposalDate ? new Date(asset.disposalDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Disposal Value:</span>
                      <p className="font-medium">
                        {asset.disposalValue ? formatCurrency(asset.disposalValue) : "N/A"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Location Details</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <p className="font-medium">{asset.location || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Department:</span>
                  <p className="font-medium">{asset.department || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Depreciation Settings</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Used For:</span>
                  <div className="flex gap-1 mt-1">
                    {asset.usedFor.map((act) => (
                      <Badge key={act} variant="outline" className="text-xs">
                        {act}
                      </Badge>
                    ))}
                  </div>
                </div>
                {asset.usefulLifeYears && (
                  <div>
                    <span className="text-sm text-muted-foreground">Useful Life:</span>
                    <p className="font-medium">{asset.usefulLifeYears} years</p>
                  </div>
                )}
                {asset.depreciationMethod && (
                  <div>
                    <span className="text-sm text-muted-foreground">Method:</span>
                    <p className="font-medium">{asset.depreciationMethod}</p>
                  </div>
                )}
                {asset.depreciationRatePercent && (
                  <div>
                    <span className="text-sm text-muted-foreground">IT Act Rate:</span>
                    <p className="font-medium">{asset.depreciationRatePercent}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Depreciation Schedules */}
      {schedules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Depreciation Schedules</h2>
          </div>
          {schedules.map((schedule) => (
            <DepreciationTable key={schedule.type} schedule={schedule} />
          ))}
        </div>
      )}
    </div>
  );
}