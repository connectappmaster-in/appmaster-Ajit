import { NavLink } from "@/components/NavLink";
import { Users, CreditCard, DollarSign, Wrench, Activity, FileText, Settings, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Users", href: "/admin?tab=users", icon: Users },
  { name: "Subscriptions", href: "/admin?tab=subscriptions", icon: CreditCard },
  { name: "Billing", href: "/admin?tab=billing", icon: DollarSign },
  { name: "Tools Access", href: "/admin?tab=tools", icon: Wrench },
  { name: "Insights", href: "/admin?tab=insights", icon: Activity },
  { name: "Audit Logs", href: "/admin?tab=logs", icon: FileText },
  { name: "Settings", href: "/admin?tab=settings", icon: Settings },
  { name: "Integrations", href: "/admin?tab=integrations", icon: Plug },
];

export const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
      </div>
      <nav className="p-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            )}
            activeClassName="bg-accent text-accent-foreground"
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
