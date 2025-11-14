import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YearSchedule } from "@/lib/depreciationCalculations";

interface DepreciationTableProps {
  schedules: YearSchedule[];
  title: string;
  currencySymbol?: string;
}

export const DepreciationTable = ({
  schedules,
  title,
  currencySymbol = "₹",
}: DepreciationTableProps) => {
  const formatCurrency = (value: number) => {
    return `${currencySymbol} ${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Financial Year</TableHead>
                <TableHead className="text-right">Opening Value</TableHead>
                <TableHead className="text-right">Additions</TableHead>
                <TableHead className="text-right">Disposals</TableHead>
                <TableHead className="text-right">Depreciation</TableHead>
                <TableHead className="text-right">Additional Dep.</TableHead>
                <TableHead className="text-right">Accumulated Dep.</TableHead>
                <TableHead className="text-right">Closing Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.year}>
                  <TableCell>{schedule.year}</TableCell>
                  <TableCell>{schedule.financialYear}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(schedule.openingValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(schedule.additions)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(schedule.disposals)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(schedule.depreciation)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(schedule.additionalDepreciation)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(schedule.accumulatedDepreciation)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(schedule.closingValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
