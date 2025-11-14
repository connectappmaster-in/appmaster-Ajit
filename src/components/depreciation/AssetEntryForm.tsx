import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ApplicableLaw, getCategories } from "@/lib/depreciationCategories";

const formSchema = z.object({
  assetName: z.string().min(1, "Asset name is required"),
  applicableLaw: z.enum(["Companies Act", "Income Tax Act", "Both"]),
  assetCategory: z.string().min(1, "Category is required"),
  purchaseDate: z.date(),
  originalCost: z.number().positive("Cost must be positive"),
  usefulLife: z.number().int().positive("Useful life must be positive"),
  residualValuePct: z.number().min(0).max(100),
  depreciationRate: z.number().min(0).max(100),
  depreciationMethod: z.enum(["SLM", "WDV"]),
  multiShiftUse: z.number().int().min(1).max(3),
  additionalDepreciationEligible: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AssetEntryFormProps {
  onSubmit: (data: FormValues) => void;
  defaultValues?: Partial<FormValues>;
}

export const AssetEntryForm = ({ onSubmit, defaultValues }: AssetEntryFormProps) => {
  const [selectedLaw, setSelectedLaw] = useState<ApplicableLaw>(
    (defaultValues?.applicableLaw as ApplicableLaw) || "Companies Act"
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetName: "",
      applicableLaw: "Companies Act",
      assetCategory: "",
      purchaseDate: new Date(),
      originalCost: 0,
      usefulLife: 0,
      residualValuePct: 5,
      depreciationRate: 0,
      depreciationMethod: "WDV",
      multiShiftUse: 1,
      additionalDepreciationEligible: false,
      ...defaultValues,
    },
  });

  const categories = getCategories(selectedLaw);

  const handleCategoryChange = (category: string) => {
    const categoryData = categories[category as keyof typeof categories];
    if (categoryData) {
      form.setValue("assetCategory", category);
      form.setValue("usefulLife", categoryData.usefulLife);
      form.setValue("depreciationRate", categoryData.rate);
      form.setValue("depreciationMethod", categoryData.method);
    }
  };

  const handleLawChange = (law: ApplicableLaw) => {
    setSelectedLaw(law);
    form.setValue("applicableLaw", law);
    form.setValue("assetCategory", "");
  };

  return (
    <Card className="p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="assetName">Asset Name / Description</Label>
            <Input
              id="assetName"
              {...form.register("assetName")}
              placeholder="e.g., Dell Laptop"
            />
            {form.formState.errors.assetName && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.assetName.message}
              </p>
            )}
          </div>

          <div>
            <Label>Applicable Law</Label>
            <RadioGroup
              value={selectedLaw}
              onValueChange={(value) => handleLawChange(value as ApplicableLaw)}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Companies Act" id="companies" />
                <Label htmlFor="companies" className="font-normal cursor-pointer">
                  Companies Act
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Income Tax Act" id="income-tax" />
                <Label htmlFor="income-tax" className="font-normal cursor-pointer">
                  Income Tax Act
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Both" id="both" />
                <Label htmlFor="both" className="font-normal cursor-pointer">
                  Both
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="category">Asset Category</Label>
            <Select
              value={form.watch("assetCategory")}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(categories).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Purchase Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1",
                    !form.watch("purchaseDate") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("purchaseDate") ? (
                    format(form.watch("purchaseDate"), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch("purchaseDate")}
                  onSelect={(date) => form.setValue("purchaseDate", date!)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="originalCost">Original Cost (₹)</Label>
              <Input
                id="originalCost"
                type="number"
                step="0.01"
                {...form.register("originalCost", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="usefulLife">Useful Life (years)</Label>
              <Input
                id="usefulLife"
                type="number"
                {...form.register("usefulLife", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="residualValuePct">Residual Value %</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Estimated salvage value at end of useful life</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="residualValuePct"
                type="number"
                step="0.01"
                {...form.register("residualValuePct", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="depreciationRate">Depreciation Rate %</Label>
              <Input
                id="depreciationRate"
                type="number"
                step="0.01"
                {...form.register("depreciationRate", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label>Depreciation Method</Label>
            <RadioGroup
              value={form.watch("depreciationMethod")}
              onValueChange={(value) =>
                form.setValue("depreciationMethod", value as "SLM" | "WDV")
              }
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SLM" id="slm" />
                <Label htmlFor="slm" className="font-normal cursor-pointer">
                  SLM (Straight Line)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="WDV" id="wdv" />
                <Label htmlFor="wdv" className="font-normal cursor-pointer">
                  WDV (Written Down Value)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="multiShift">Multi-shift Use</Label>
            <Select
              value={form.watch("multiShiftUse").toString()}
              onValueChange={(value) =>
                form.setValue("multiShiftUse", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Single Shift</SelectItem>
                <SelectItem value="2">Double Shift (+50%)</SelectItem>
                <SelectItem value="3">Triple Shift (+100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedLaw !== "Companies Act" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="additional-dep"
                checked={form.watch("additionalDepreciationEligible")}
                onCheckedChange={(checked) =>
                  form.setValue("additionalDepreciationEligible", checked)
                }
              />
              <Label htmlFor="additional-dep" className="font-normal cursor-pointer">
                Additional Depreciation Eligible (IT Act)
              </Label>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full">
          Calculate Depreciation Schedule
        </Button>
      </form>
    </Card>
  );
};
