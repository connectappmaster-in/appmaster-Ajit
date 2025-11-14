import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AssetEntryForm } from "@/components/depreciation/AssetEntryForm";
import { DepreciationTable } from "@/components/depreciation/DepreciationTable";
import { StepIndicator } from "@/components/depreciation/StepIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  calculateCompaniesActSchedule,
  calculateIncomeTaxActSchedule,
  YearSchedule,
  AssetInput,
} from "@/lib/depreciationCalculations";

const steps = [
  { id: 1, name: "Asset Input", description: "Enter asset details" },
  { id: 2, name: "Calculation", description: "View schedule" },
  { id: 3, name: "Export", description: "Download reports" },
  { id: 4, name: "Summary", description: "All assets" },
  { id: 5, name: "Settings", description: "Preferences" },
];

const Depreciation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [assetData, setAssetData] = useState<AssetInput | null>(null);
  const [companiesActSchedule, setCompaniesActSchedule] = useState<YearSchedule[]>([]);
  const [incomeTaxActSchedule, setIncomeTaxActSchedule] = useState<YearSchedule[]>([]);

  const handleAssetSubmit = (data: any) => {
    const input: AssetInput = {
      ...data,
      fyStartMonth: 4,
      fyStartDay: 1,
    };

    setAssetData(input);

    if (data.applicableLaw === "Companies Act" || data.applicableLaw === "Both") {
      const schedule = calculateCompaniesActSchedule(input);
      setCompaniesActSchedule(schedule);
    }

    if (data.applicableLaw === "Income Tax Act" || data.applicableLaw === "Both") {
      const schedule = calculateIncomeTaxActSchedule(input);
      setIncomeTaxActSchedule(schedule);
    }

    setCurrentStep(2);
    toast.success("Schedule Generated Successfully ✅");
  };

  const handleExportExcel = () => {
    toast.info("Excel export will be implemented with xlsx library");
  };

  const handleExportPDF = () => {
    toast.info("PDF export will be implemented with jsPDF library");
  };

  const handleExportCSV = () => {
    if (!assetData) return;

    const schedule = companiesActSchedule.length > 0 ? companiesActSchedule : incomeTaxActSchedule;
    
    const headers = [
      "Year",
      "Financial Year",
      "Opening Value",
      "Additions",
      "Disposals",
      "Depreciation",
      "Additional Depreciation",
      "Accumulated Depreciation",
      "Closing Value",
    ];

    const rows = schedule.map((s) => [
      s.year,
      s.financialYear,
      s.openingValue,
      s.additions,
      s.disposals,
      s.depreciation,
      s.additionalDepreciation,
      s.accumulatedDepreciation,
      s.closingValue,
    ]);

    const csvContent = [
      `Asset: ${assetData.assetName}`,
      `Category: ${assetData.assetCategory}`,
      `Applicable Law: ${assetData.applicableLaw}`,
      "",
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `depreciation-${assetData.assetName.replace(/\s+/g, "-")}.csv`;
    a.click();

    toast.success("CSV exported successfully");
  };

  const resetForm = () => {
    setCurrentStep(1);
    setAssetData(null);
    setCompaniesActSchedule([]);
    setIncomeTaxActSchedule([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Depreciation Schedule</h1>
          <p className="text-muted-foreground">
            Calculate depreciation as per Companies Act & Income Tax Act
          </p>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto">
            <AssetEntryForm onSubmit={handleAssetSubmit} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                Depreciation Schedule - {assetData?.assetName}
              </h2>
              <Button onClick={resetForm} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Asset
              </Button>
            </div>

            {assetData && (
              <Card>
                <CardHeader>
                  <CardTitle>Asset Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{assetData.assetCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Original Cost</p>
                    <p className="font-medium">₹ {assetData.originalCost.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-medium">{assetData.depreciationMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rate</p>
                    <p className="font-medium">{assetData.depreciationRate}%</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {companiesActSchedule.length > 0 && (
              <DepreciationTable
                schedules={companiesActSchedule}
                title="Companies Act Schedule (Schedule II)"
              />
            )}

            {incomeTaxActSchedule.length > 0 && (
              <DepreciationTable
                schedules={incomeTaxActSchedule}
                title="Income Tax Act Schedule (WDV Method)"
              />
            )}

            <div className="flex justify-center gap-4 pt-6">
              <Button onClick={() => setCurrentStep(3)} size="lg">
                Export Reports
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Depreciation Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                >
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Download as Excel (.xlsx)
                </Button>

                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Download as PDF
                </Button>

                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Export as CSV
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button onClick={() => setCurrentStep(2)} variant="outline">
                Back to Schedule
              </Button>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Another Asset
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Depreciation;
