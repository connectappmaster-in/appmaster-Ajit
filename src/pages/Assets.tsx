import { AssetList } from "@/components/assets/AssetList";

export default function Assets() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Assets</h1>
        <p className="text-muted-foreground mt-2">
          Manage your fixed assets
        </p>
      </div>
      <AssetList />
    </div>
  );
}