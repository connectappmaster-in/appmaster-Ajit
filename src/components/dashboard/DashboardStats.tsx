import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useAssets } from "@/hooks/useAssets";
import { formatCurrency } from "@/lib/depreciation";

export function DashboardStats() {
  const { stats } = useAssets();

  const statsData = [
    {
      title: "Total Active Assets",
      value: stats.activeAssets.toString(),
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary-light"
    },
    {
      title: "Total Purchase Value",
      value: formatCurrency(stats.totalPurchaseValue),
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success-light"
    },
    {
      title: "Current WDV (Companies Act)",
      value: formatCurrency(stats.totalCurrentWDV),
      icon: CheckCircle,
      color: "text-accent",
      bgColor: "bg-accent-light"
    },
    {
      title: "Total Disposed Assets",
      value: stats.disposedAssets.toString(),
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning-light"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}