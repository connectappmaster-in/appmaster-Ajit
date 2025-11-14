import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const assetFormSchema = z.object({
  asset_name: z.string().min(1, "Asset name is required"),
  applicable_law: z.enum(["companies_act", "income_tax_act"], {
    required_error: "Please select applicable law",
  }),
  asset_category: z.string().min(1, "Category is required"),
  purchase_date: z.date({
    required_error: "Purchase date is required",
  }),
  original_cost: z.string().min(1, "Original cost is required"),
  useful_life: z.string().min(1, "Useful life is required"),
  residual_value_pct: z.string().optional(),
  depreciation_rate: z.string().min(1, "Depreciation rate is required"),
  depreciation_method: z.enum(["SLM", "WDV"], {
    required_error: "Please select depreciation method",
  }),
  multi_shift_use: z.string().optional(),
  additional_depreciation_eligible: z.boolean().optional(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

interface AssetFormProps {
  onSuccess: () => void;
  editingAsset?: any;
  onCancel?: () => void;
}

export default function AssetForm({ onSuccess, editingAsset, onCancel }: AssetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: editingAsset
      ? {
          asset_name: editingAsset.asset_name,
          applicable_law: editingAsset.applicable_law,
          asset_category: editingAsset.asset_category,
          purchase_date: new Date(editingAsset.purchase_date),
          original_cost: editingAsset.original_cost.toString(),
          useful_life: editingAsset.useful_life.toString(),
          residual_value_pct: editingAsset.residual_value_pct?.toString() || "5",
          depreciation_rate: editingAsset.depreciation_rate.toString(),
          depreciation_method: editingAsset.depreciation_method,
          multi_shift_use: editingAsset.multi_shift_use?.toString() || "1",
          additional_depreciation_eligible: editingAsset.additional_depreciation_eligible || false,
        }
      : {
          residual_value_pct: "5",
          multi_shift_use: "1",
          additional_depreciation_eligible: false,
        },
  });

  const onSubmit = async (data: AssetFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to manage assets");
        return;
      }

      const assetData = {
        asset_name: data.asset_name,
        applicable_law: data.applicable_law,
        asset_category: data.asset_category,
        purchase_date: format(data.purchase_date, "yyyy-MM-dd"),
        original_cost: parseFloat(data.original_cost),
        useful_life: parseInt(data.useful_life),
        residual_value_pct: data.residual_value_pct ? parseFloat(data.residual_value_pct) : 5,
        depreciation_rate: parseFloat(data.depreciation_rate),
        depreciation_method: data.depreciation_method,
        multi_shift_use: data.multi_shift_use ? parseInt(data.multi_shift_use) : 1,
        additional_depreciation_eligible: data.additional_depreciation_eligible || false,
        user_id: user.id,
      };

      if (editingAsset) {
        const { error } = await (supabase as any)
          .from("assets")
          .update(assetData)
          .eq("id", editingAsset.id);

        if (error) throw error;
        toast.success("Asset updated successfully");
      } else {
        const { error } = await (supabase as any)
          .from("assets")
          .insert([assetData]);

        if (error) throw error;
        toast.success("Asset created successfully");
      }

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error("Error saving asset:", error);
      toast.error(error.message || "Failed to save asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    form.reset();
    if (onCancel) onCancel();
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle>{editingAsset ? "Edit Asset" : "Add Asset"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="asset_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name / Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Laptop Dell XPS 15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicable_law"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applicable Law</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select law" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="companies_act">Companies Act</SelectItem>
                      <SelectItem value="income_tax_act">Income Tax Act</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="asset_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Computers">Computers</SelectItem>
                      <SelectItem value="Office Equipment">Office Equipment</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Vehicles">Vehicles</SelectItem>
                      <SelectItem value="Plant & Machinery">Plant & Machinery</SelectItem>
                      <SelectItem value="Building">Building</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Purchase Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="original_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="useful_life"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Useful Life (years)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="residual_value_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residual Value (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="depreciation_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depreciation Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="depreciation_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depreciation Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SLM">Straight Line Method (SLM)</SelectItem>
                      <SelectItem value="WDV">Written Down Value (WDV)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="multi_shift_use"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Multi-shift Use</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shifts" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Single Shift</SelectItem>
                      <SelectItem value="2">Double Shift (1.5x)</SelectItem>
                      <SelectItem value="3">Triple Shift (2x)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Saving..." : editingAsset ? "Update Asset" : "Save Asset"}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="flex-1">
                {editingAsset ? "Cancel" : "Reset"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
