import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export const SubscriptionsManagement = () => {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        // @ts-ignore - Types will be regenerated after migration
        .from('subscriptions')
        .select(`
          *,
          tools(display_name),
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
      case 'trial': return 'default';
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Subscriptions Management</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Tool</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Trial End</TableHead>
            <TableHead>Subscription End</TableHead>
            <TableHead>Auto Renew</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions?.map((sub: any) => (
            <TableRow key={sub.id}>
              <TableCell>{sub.profiles?.full_name}</TableCell>
              <TableCell>{sub.tools?.display_name}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(sub.status)}>{sub.status}</Badge>
              </TableCell>
              <TableCell>
                {sub.trial_end_date ? format(new Date(sub.trial_end_date), 'PP') : '-'}
              </TableCell>
              <TableCell>
                {sub.subscription_end_date ? format(new Date(sub.subscription_end_date), 'PP') : '-'}
              </TableCell>
              <TableCell>
                <Badge variant={sub.auto_renew ? 'default' : 'secondary'}>
                  {sub.auto_renew ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
