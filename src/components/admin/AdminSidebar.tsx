import { NavLink } from "@/components/NavLink";
import { Users, CreditCard, DollarSign, Wrench, Activity, FileText, Settings, Plug, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen bg-gradient-to-b from-card to-accent/5 border-r border-border shadow-lg z-50 transition-all duration-300 ease-in-out",
        "w-64 lg:w-56",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-4 lg:p-5 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Management Console</p>
          </div>
          
          {/* Close button - mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="p-2.5">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 mb-1 group"
              )}
              activeClassName="bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border-l-2 border-primary"
              onClick={() => {
                // Close sidebar on mobile when clicking a link
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
            >
              <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
