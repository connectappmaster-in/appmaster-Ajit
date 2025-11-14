import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DepreciationScheduleTable } from "./DepreciationScheduleTable";
import { Download, RefreshCw } from "lucide-react";

interface Asset {
  id: string;
  asset_name: string;
  original_cost: number;
  useful_life: number;
  residual_value_pct: number;
  depreciation_method: string;
  depreciation_rate: number;
  purchase_date: string;
}

interface Schedule {
  year_number: number;
  financial_year: string;
  opening_value: number;
  additions: number;
  disposals: number;
  depreciation: number;
  accumulated_depreciation: number;
  closing_value: number;
}

export const CompaniesActTab = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .in('applicable_law', ['Companies Act', 'Both'])
        .order('asset_name');

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
      toast({
        title: "Error",
        description: "Failed to load assets",
        variant: "destructive"
      });
    }
  };

  const loadSchedule = async () => {
    if (!selectedAssetId) return;
    
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('depreciation_schedules')
        .select('*')
        .eq('asset_id', selectedAssetId)
        .order('year_number');

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast({
        title: "Error",
        description: "Failed to load depreciation schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAssetId) {
      loadSchedule();
    }
  }, [selectedAssetId]);

  const handleRecalculate = async () => {
    if (!selectedAssetId) return;
    
    const asset = assets.find(a => a.id === selectedAssetId);
    if (!asset) return;

    setLoading(true);
    try {
      // Calculate depreciation schedule
      const scheduleData: Schedule[] = [];
      let openingValue = asset.original_cost;
      let accumulatedDep = 0;

      const purchaseYear = new Date(asset.purchase_date).getFullYear();
      
      for (let year = 1; year <= asset.useful_life; year++) {
        const financialYear = `FY ${purchaseYear + year - 1}-${(purchaseYear + year).toString().slice(-2)}`;
        
        let depreciation = 0;
        if (asset.depreciation_method === 'SLM') {
          const salvageValue = asset.original_cost * (asset.residual_value_pct / 100);
          depreciation = (asset.original_cost - salvageValue) / asset.useful_life;
        } else if (asset.depreciation_method === 'WDV') {
          depreciation = openingValue * (asset.depreciation_rate / 100);
        }

        accumulatedDep += depreciation;
        const closingValue = openingValue - depreciation;

        scheduleData.push({
          year_number: year,
          financial_year: financialYear,
          opening_value: Math.round(openingValue),
          additions: 0,
          disposals: 0,
          depreciation: Math.round(depreciation),
          accumulated_depreciation: Math.round(accumulatedDep),
          closing_value: Math.round(closingValue)
        });

        openingValue = closingValue;
      }

      // Save to database
      const { error: deleteError } = await (supabase as any)
        .from('depreciation_schedules')
        .delete()
        .eq('asset_id', selectedAssetId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await (supabase as any)
        .from('depreciation_schedules')
        .insert(
          scheduleData.map(s => ({
            asset_id: selectedAssetId,
            ...s
          }))
        );

      if (insertError) throw insertError;

      setSchedule(scheduleData);
      toast({
        title: "Success",
        description: "Depreciation schedule calculated successfully",
      });
    } catch (error) {
      console.error('Error calculating depreciation:', error);
      toast({
        title: "Error",
        description: "Failed to calculate depreciation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Depreciation Schedule – Companies Act</h2>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1 max-w-md">
          <label className="text-sm font-medium mb-2 block">Select Asset</label>
          <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map(asset => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.asset_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleRecalculate} 
          disabled={!selectedAssetId || loading}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Recalculate
        </Button>
      </div>

      {schedule.length > 0 && (
        <>
          <DepreciationScheduleTable data={schedule} type="companies" />
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
