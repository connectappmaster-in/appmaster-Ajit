import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { YearSchedule } from "@/lib/depreciationCalculations";

export interface DepreciationSchedule {
  id: string;
  asset_id: string;
  year_number: number;
  financial_year: string;
  opening_value: number;
  additions: number;
  disposals: number;
  depreciation: number;
  additional_depreciation: number;
  accumulated_depreciation: number;
  closing_value: number;
  created_at: string;
}

export const useDepreciationSchedules = (assetId?: string) => {
  return useQuery({
    queryKey: ["depreciation_schedules", assetId],
    queryFn: async () => {
      let query = (supabase as any).from("depreciation_schedules").select("*");
      
      if (assetId) {
        query = query.eq("asset_id", assetId);
      }

      const { data, error } = await query.order("year_number", { ascending: true });

      if (error) throw error;
      return data as DepreciationSchedule[];
    },
    enabled: !!assetId,
  });
};

export const useSaveSchedules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assetId,
      schedules,
    }: {
      assetId: string;
      schedules: YearSchedule[];
    }) => {
      // Delete existing schedules for this asset
      await (supabase as any)
        .from("depreciation_schedules")
        .delete()
        .eq("asset_id", assetId);

      // Insert new schedules
      const schedulesData = schedules.map((schedule) => ({
        asset_id: assetId,
        year_number: schedule.year,
        financial_year: schedule.financialYear,
        opening_value: schedule.openingValue,
        additions: schedule.additions,
        disposals: schedule.disposals,
        depreciation: schedule.depreciation,
        additional_depreciation: schedule.additionalDepreciation,
        accumulated_depreciation: schedule.accumulatedDepreciation,
        closing_value: schedule.closingValue,
      }));

      const { error } = await (supabase as any)
        .from("depreciation_schedules")
        .insert(schedulesData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depreciation_schedules"] });
      toast.success("Schedules saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save schedules: ${error.message}`);
    },
  });
};
