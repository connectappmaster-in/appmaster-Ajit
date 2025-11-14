import { Card } from "@/components/ui/card";
import { Users, CreditCard, Wrench, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const DashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-admin-dashboard');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, gradient: "from-blue-500 to-blue-600", bg: "bg-blue-500/10", iconColor: "text-blue-600" },
    { title: "Active Subscriptions", value: stats?.totalSubscriptions || 0, icon: CreditCard, gradient: "from-green-500 to-green-600", bg: "bg-green-500/10", iconColor: "text-green-600" },
    { title: "Active Tools", value: stats?.activeTools || 0, icon: Wrench, gradient: "from-purple-500 to-purple-600", bg: "bg-purple-500/10", iconColor: "text-purple-600" },
    { title: "Total Revenue", value: `₹${stats?.totalRevenue || 0}`, icon: DollarSign, gradient: "from-yellow-500 to-yellow-600", bg: "bg-yellow-500/10", iconColor: "text-yellow-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card 
          key={stat.title} 
          className="p-6 hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/30 hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{stat.value}</p>
            </div>
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("h-7 w-7 transition-transform group-hover:scale-110", stat.iconColor)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
