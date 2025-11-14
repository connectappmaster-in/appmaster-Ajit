import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Asset {
  id: string;
  user_id: string;
  asset_name: string;
  applicable_law: string;
  asset_category: string;
  purchase_date: string;
  original_cost: number;
  useful_life: number;
  residual_value_pct: number;
  depreciation_rate: number;
  depreciation_method: string;
  multi_shift_use: number;
  additional_depreciation_eligible: boolean;
  created_at: string;
  updated_at: string;
}

export const useAssets = () => {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Asset[];
    },
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: Omit<Asset, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const { data, error } = await (supabase as any)
        .from("assets")
        .insert({
          ...asset,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Asset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Asset saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save asset: ${error.message}`);
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await (supabase as any)
        .from("assets")
        .delete()
        .eq("id", assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Asset deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete asset: ${error.message}`);
    },
  });
};
