import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity } from "lucide-react";

export const InsightsDashboard = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['admin-insights'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-insights');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-foreground mt-1">{insights?.activeUsers || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Trial Users</p>
              <p className="text-2xl font-bold text-foreground mt-1">{insights?.trialUsers || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Subscriptions</p>
              <p className="text-2xl font-bold text-foreground mt-1">{insights?.totalSubscriptions || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Tool Usage</h3>
        <div className="space-y-2">
          {Object.entries(insights?.toolUsage || {}).map(([tool, count]: [string, any]) => (
            <div key={tool} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{tool}</span>
              <span className="text-sm font-medium text-foreground">{count} subscriptions</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
