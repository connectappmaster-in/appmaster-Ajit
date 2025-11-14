import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export const ToolsAccess = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tools, isLoading } = useQuery({
    queryKey: ['admin-tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        // @ts-ignore - Types will be regenerated after migration
        .from('tools')
        .select('*')
        .order('display_name');
      if (error) throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ toolId, isActive }: { toolId: string; isActive: boolean }) => {
      const { data, error } = await supabase.functions.invoke('toggle-tool-access', {
        body: { toolId, isActive },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      toast({ title: "Tool access updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update tool access", variant: "destructive" });
      console.error('Toggle error:', error);
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Tools Access Control</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tool Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools?.map((tool: any) => (
            <TableRow key={tool.id}>
              <TableCell className="font-medium">{tool.display_name}</TableCell>
              <TableCell>{tool.category}</TableCell>
              <TableCell className="font-mono text-sm">{tool.route}</TableCell>
              <TableCell>
                <span className={tool.is_active ? 'text-green-600' : 'text-red-600'}>
                  {tool.is_active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell>
                <Switch
                  checked={tool.is_active}
                  onCheckedChange={(checked) => 
                    toggleMutation.mutate({ toolId: tool.id, isActive: checked })
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
