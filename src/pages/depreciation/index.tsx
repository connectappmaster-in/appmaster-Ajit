import Navbar from "@/components/Navbar";
import { DepreciationTabs } from "./components/DepreciationTabs";

const Depreciation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Depreciation Management</h1>
            <p className="text-lg text-muted-foreground">
              Calculate and monitor depreciation under Companies Act and Income Tax Act
            </p>
          </div>

          <DepreciationTabs />
        </div>
      </div>
    </div>
  );
};

export default Depreciation;
