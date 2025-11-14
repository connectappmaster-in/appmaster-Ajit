import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export const BillingManagement = () => {
  const { data: billing, isLoading } = useQuery({
    queryKey: ['admin-billing'],
    queryFn: async () => {
      const { data, error } = await supabase
        // @ts-ignore - Types will be regenerated after migration
        .from('billing')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Billing Management</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Gateway</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Paid Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {billing?.map((bill: any) => (
            <TableRow key={bill.id}>
              <TableCell>{bill.profiles?.full_name}</TableCell>
              <TableCell>₹{Number(bill.amount).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(bill.payment_status)}>{bill.payment_status}</Badge>
              </TableCell>
              <TableCell>{bill.payment_gateway || '-'}</TableCell>
              <TableCell className="font-mono text-sm">{bill.transaction_id || '-'}</TableCell>
              <TableCell>
                {bill.due_date ? format(new Date(bill.due_date), 'PP') : '-'}
              </TableCell>
              <TableCell>
                {bill.paid_date ? format(new Date(bill.paid_date), 'PP') : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
