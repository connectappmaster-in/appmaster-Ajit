import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calculator, FileText, Package } from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  {
    title: "Add New Asset",
    description: "Register a new fixed asset",
    icon: Plus,
    href: "/assets/new",
    variant: "default" as const
  },
  {
    title: "View Assets",
    description: "Browse all assets",
    icon: Package,
    href: "/assets",
    variant: "outline" as const
  },
  {
    title: "Depreciation Schedule",
    description: "View depreciation calculations",
    icon: Calculator,
    href: "/depreciation",
    variant: "outline" as const
  },
  {
    title: "Generate Report",
    description: "Export asset reports",
    icon: FileText,
    href: "/reports",
    variant: "outline" as const
  }
];

export function QuickActions() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Button
                variant={action.variant}
                className="w-full h-auto p-4 flex flex-col items-center space-y-2 text-center"
              >
                <action.icon className="h-6 w-6" />
                <div>
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}