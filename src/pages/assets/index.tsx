import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AssetForm from "./components/AssetForm";
import AssetTable from "./components/AssetTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Assets = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to view assets");
        return;
      }

      const { data, error } = await (supabase as any)
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAssets(data || []);
    } catch (error: any) {
      console.error("Error fetching assets:", error);
      toast.error("Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSuccess = () => {
    fetchAssets();
    setEditingAsset(null);
  };

  const handleEdit = (asset: any) => {
    setEditingAsset(asset);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingAsset(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Asset Register</h1>
            <p className="text-lg text-muted-foreground">
              Add, edit, and manage your depreciation assets
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <AssetForm
                onSuccess={handleSuccess}
                editingAsset={editingAsset}
                onCancel={handleCancel}
              />
            </div>
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading assets...</p>
                </div>
              ) : (
                <AssetTable assets={assets} onRefresh={fetchAssets} onEdit={handleEdit} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assets;
