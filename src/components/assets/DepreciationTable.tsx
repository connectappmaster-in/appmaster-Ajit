import { DepreciationSchedule } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/depreciation";
import { Download } from "lucide-react";

interface DepreciationTableProps {
  schedule: DepreciationSchedule;
}

export function DepreciationTable({ schedule }: DepreciationTableProps) {
  const downloadSchedule = () => {
    // Create CSV content
    const headers = ["Year", "Opening Value", "Depreciation", "Closing Value"];
    const rows = schedule.entries.map(entry => [
      entry.year.toString(),
      entry.openingValue.toFixed(2),
      entry.depreciation.toFixed(2),
      entry.closingValue.toFixed(2)
    ]);
    
    const csvContent = [
      [`Depreciation Schedule - ${schedule.type}`],
      [],
      headers,
      ...rows,
      [],
      [`Total Depreciation: ${schedule.totalDepreciation.toFixed(2)}`],
      [`Current WDV: ${schedule.currentWDV.toFixed(2)}`]
    ].map(row => row.join(",")).join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `depreciation-schedule-${schedule.type.toLowerCase().replace(" ", "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              {schedule.type}
              <Badge variant="outline">
                {schedule.entries.length} years
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total Depreciation: {formatCurrency(schedule.totalDepreciation)} | 
              Current WDV: {formatCurrency(schedule.currentWDV)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadSchedule}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium text-sm">Year</th>
                <th className="text-right py-2 px-3 font-medium text-sm">Opening Value</th>
                <th className="text-right py-2 px-3 font-medium text-sm">Depreciation</th>
                <th className="text-right py-2 px-3 font-medium text-sm">Closing Value</th>
              </tr>
            </thead>
            <tbody>
              {schedule.entries.map((entry, index) => (
                <tr key={entry.year} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <td className="py-2 px-3 text-sm">
                    <div className="flex items-center gap-2">
                      {entry.year}
                      {entry.isProRata && (
                        <Badge variant="secondary" className="text-xs">
                          Pro-rata
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-sm text-right font-mono">
                    {formatCurrency(entry.openingValue)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right font-mono text-destructive">
                    {formatCurrency(entry.depreciation)}
                  </td>
                  <td className="py-2 px-3 text-sm text-right font-mono font-medium">
                    {formatCurrency(entry.closingValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}