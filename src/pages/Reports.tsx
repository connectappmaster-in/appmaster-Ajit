import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAssets } from '@/hooks/useAssets';
import { FixedAssetRegister } from '@/components/reports/FixedAssetRegister';
import { DepreciationReport } from '@/components/reports/DepreciationReport';
import { DisposalReport } from '@/components/reports/DisposalReport';
import { ReconciliationReport } from '@/components/reports/ReconciliationReport';
import { FileText, TrendingDown, XCircle, GitCompare } from 'lucide-react';

export default function Reports() {
  const { assets } = useAssets();
  const [activeTab, setActiveTab] = useState('asset-register');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generate and export comprehensive asset and depreciation reports
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="asset-register" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Asset Register</span>
          </TabsTrigger>
          <TabsTrigger value="depreciation" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Depreciation</span>
          </TabsTrigger>
          <TabsTrigger value="disposal" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Disposal</span>
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            <span className="hidden sm:inline">Reconciliation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="asset-register">
          <FixedAssetRegister assets={assets} />
        </TabsContent>

        <TabsContent value="depreciation">
          <DepreciationReport assets={assets} />
        </TabsContent>

        <TabsContent value="disposal">
          <DisposalReport assets={assets} />
        </TabsContent>

        <TabsContent value="reconciliation">
          <ReconciliationReport assets={assets} />
        </TabsContent>
      </Tabs>
    </div>
  );
}