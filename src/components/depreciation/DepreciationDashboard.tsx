import { Asset } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/depreciation";
import { TrendingDown, Building2, Calculator, Calendar } from "lucide-react";
import { calculateDepreciation } from "@/lib/depreciation";
import { getYear } from "date-fns";

interface DepreciationDashboardProps {
  assets: Asset[];
}

export function DepreciationDashboard({ assets }: DepreciationDashboardProps) {
  const currentYear = getYear(new Date());
  
  // Calculate stats
  const assetsUnderDepreciation = assets.filter(a => a.status === 'Active');
  
  const companiesActAssets = assetsUnderDepreciation.filter(a => 
    a.usedFor.includes('Companies Act')
  );
  
  const itActAssets = assetsUnderDepreciation.filter(a => 
    a.usedFor.includes('IT Act')
  );
  
  // Calculate total depreciation for current year
  const currentYearDepreciation = {
    companiesAct: companiesActAssets.reduce((sum, asset) => {
      const schedules = calculateDepreciation(asset);
      const companiesSchedule = schedules.find(s => s.type === 'Companies Act');
      const currentYearEntry = companiesSchedule?.entries.find(e => e.year === currentYear);
      return sum + (currentYearEntry?.depreciation || 0);
    }, 0),
    itAct: itActAssets.reduce((sum, asset) => {
      const schedules = calculateDepreciation(asset);
      const itSchedule = schedules.find(s => s.type === 'IT Act');
      const currentYearEntry = itSchedule?.entries.find(e => e.year === currentYear);
      return sum + (currentYearEntry?.depreciation || 0);
    }, 0)
  };
  
  // Calculate total WDV
  const totalWDV = {
    companiesAct: companiesActAssets.reduce((sum, asset) => {
      const schedules = calculateDepreciation(asset);
      const companiesSchedule = schedules.find(s => s.type === 'Companies Act');
      return sum + (companiesSchedule?.currentWDV || 0);
    }, 0),
    itAct: itActAssets.reduce((sum, asset) => {
      const schedules = calculateDepreciation(asset);
      const itSchedule = schedules.find(s => s.type === 'IT Act');
      return sum + (itSchedule?.currentWDV || 0);
    }, 0)
  };

  const stats = [
    {
      title: "Assets Under Depreciation",
      value: assetsUnderDepreciation.length.toString(),
      subtitle: `${companiesActAssets.length} Companies Act, ${itActAssets.length} IT Act`,
      icon: Building2,
      trend: null
    },
    {
      title: "Depreciation This Year",
      value: formatCurrency(currentYearDepreciation.companiesAct + currentYearDepreciation.itAct),
      subtitle: `CA: ${formatCurrency(currentYearDepreciation.companiesAct)} | IT: ${formatCurrency(currentYearDepreciation.itAct)}`,
      icon: TrendingDown,
      trend: "down"
    },
    {
      title: "Total WDV - Companies Act",
      value: formatCurrency(totalWDV.companiesAct),
      subtitle: `${companiesActAssets.length} assets`,
      icon: Calculator,
      trend: null
    },
    {
      title: "Total WDV - IT Act",
      value: formatCurrency(totalWDV.itAct),
      subtitle: `${itActAssets.length} assets`,
      icon: Calculator,
      trend: null
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Depreciation Overview</h2>
          <p className="text-muted-foreground">Financial Year {currentYear}-{currentYear + 1}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Last Updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.subtitle}
              </p>
              {stat.trend && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 text-xs"
                >
                  {stat.trend === "down" ? "↓" : "↑"}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}