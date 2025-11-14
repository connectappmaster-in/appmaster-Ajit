import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DepreciationScheduleTable } from "./DepreciationScheduleTable";
import { Download, RefreshCw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Asset {
  id: string;
  asset_name: string;
  original_cost: number;
  useful_life: number;
  depreciation_rate: number;
  purchase_date: string;
  additional_depreciation_eligible: boolean;
}

interface Schedule {
  year_number: number;
  financial_year: string;
  opening_value: number;
  additions: number;
  disposals: number;
  depreciation: number;
  additional_depreciation: number;
  accumulated_depreciation: number;
  closing_value: number;
}

export const IncomeTaxActTab = () => {
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
        .in('applicable_law', ['Income Tax Act', 'Both'])
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

  const handleRecalculate = async () => {
    if (!selectedAssetId) return;
    
    const asset = assets.find(a => a.id === selectedAssetId);
    if (!asset) return;

    setLoading(true);
    try {
      const scheduleData: Schedule[] = [];
      let openingValue = asset.original_cost;
      let accumulatedDep = 0;

      const purchaseDate = new Date(asset.purchase_date);
      const purchaseYear = purchaseDate.getFullYear();
      const fyEndDate = new Date(purchaseYear + 1, 2, 31); // March 31
      const daysUsed = Math.floor((fyEndDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      const isHalfYear = daysUsed < 180;
      
      for (let year = 1; year <= asset.useful_life; year++) {
        const financialYear = `FY ${purchaseYear + year - 1}-${(purchaseYear + year).toString().slice(-2)}`;
        
        // WDV depreciation
        let depRate = asset.depreciation_rate;
        if (year === 1 && isHalfYear) {
          depRate = depRate / 2;
        }
        
        const depreciation = openingValue * (depRate / 100);
        
        // Additional depreciation (20% or 10% if half year)
        let additionalDep = 0;
        if (asset.additional_depreciation_eligible && year === 1) {
          const addDepRate = isHalfYear ? 10 : 20;
          additionalDep = asset.original_cost * (addDepRate / 100);
        }

        const totalDep = depreciation + additionalDep;
        accumulatedDep += totalDep;
        const closingValue = openingValue - depreciation;

        scheduleData.push({
          year_number: year,
          financial_year: financialYear,
          opening_value: Math.round(openingValue),
          additions: 0,
          disposals: 0,
          depreciation: Math.round(depreciation),
          additional_depreciation: Math.round(additionalDep),
          accumulated_depreciation: Math.round(accumulatedDep),
          closing_value: Math.round(closingValue)
        });

        openingValue = closingValue;
      }

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
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Depreciation Schedule – Income Tax Act</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Half-year rule applied if asset used for less than 180 days in first year. 20% additional depreciation if eligible (10% for half year).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
          <DepreciationScheduleTable data={schedule} type="income-tax" />
          
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
