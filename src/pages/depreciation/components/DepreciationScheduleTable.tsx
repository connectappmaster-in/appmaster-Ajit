import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Schedule {
  year_number: number;
  financial_year: string;
  opening_value: number;
  additions: number;
  disposals: number;
  depreciation: number;
  additional_depreciation?: number;
  accumulated_depreciation: number;
  closing_value: number;
}

interface Props {
  data: Schedule[];
  type: 'companies' | 'income-tax';
}

export const DepreciationScheduleTable = ({ data, type }: Props) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const totals = data.reduce((acc, row) => ({
    depreciation: acc.depreciation + row.depreciation,
    additional_depreciation: acc.additional_depreciation + (row.additional_depreciation || 0),
    accumulated_depreciation: row.accumulated_depreciation, // Last value
  }), { depreciation: 0, additional_depreciation: 0, accumulated_depreciation: 0 });

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Year</TableHead>
            <TableHead className="font-semibold">Financial Year</TableHead>
            <TableHead className="font-semibold text-right">Opening Value</TableHead>
            <TableHead className="font-semibold text-right">Additions</TableHead>
            <TableHead className="font-semibold text-right">Disposals</TableHead>
            <TableHead className="font-semibold text-right">Depreciation</TableHead>
            {type === 'income-tax' && (
              <TableHead className="font-semibold text-right">Additional Dep.</TableHead>
            )}
            <TableHead className="font-semibold text-right">Accumulated Dep.</TableHead>
            <TableHead className="font-semibold text-right">Closing Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.year_number} className="hover:bg-muted/30">
              <TableCell>{row.year_number}</TableCell>
              <TableCell>{row.financial_year}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.opening_value)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.additions)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.disposals)}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(row.depreciation)}</TableCell>
              {type === 'income-tax' && (
                <TableCell className="text-right font-medium">{formatCurrency(row.additional_depreciation || 0)}</TableCell>
              )}
              <TableCell className="text-right">{formatCurrency(row.accumulated_depreciation)}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(row.closing_value)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/70 font-bold">
            <TableCell colSpan={5}>Total</TableCell>
            <TableCell className="text-right">{formatCurrency(totals.depreciation)}</TableCell>
            {type === 'income-tax' && (
              <TableCell className="text-right">{formatCurrency(totals.additional_depreciation)}</TableCell>
            )}
            <TableCell className="text-right">{formatCurrency(totals.accumulated_depreciation)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
