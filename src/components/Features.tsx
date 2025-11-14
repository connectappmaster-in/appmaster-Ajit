import { BarChart3, ShoppingCart, Users, Briefcase, Package, Calendar, TrendingDown, FileText, Clock, UserPlus, Ticket, CreditCard, Laptop, Store, Box, PhoneCall, Target, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
const features = [{
  icon: Users,
  title: "Finance",
  tools: [{
    name: "Depreciation",
    path: "/depreciation",
    icon: TrendingDown
  }, {
    name: "Invoicing",
    path: "/invoicing",
    icon: FileText
  }]
}, {
  icon: ShoppingCart,
  title: "HR",
  tools: [{
    name: "Attendance",
    path: "/attendance",
    icon: Clock
  }, {
    name: "Recruitment",
    path: "/recruitment",
    icon: UserPlus
  }]
}, {
  icon: BarChart3,
  title: "IT",
  tools: [{
    name: "Tickets Handling",
    path: "/tickets",
    icon: Ticket
  }, {
    name: "Subscriptions",
    path: "/subscriptions",
    icon: CreditCard
  }, {
    name: "Assets",
    path: "/assets",
    icon: Laptop
  }]
}, {
  icon: Briefcase,
  title: "Shop",
  tools: [{
    name: "Income & Expenditure Tracker",
    path: "/shop-income-expense",
    icon: Store
  }]
}, {
  icon: Package,
  title: "Manufacturing",
  tools: [{
    name: "Inventory",
    path: "/inventory",
    icon: Box
  }]
}, {
  icon: Calendar,
  title: "Sales",
  tools: [{
    name: "CRM",
    path: "/crm",
    icon: Target
  }]
}, {
  icon: Package,
  title: "Marketing",
  tools: [{
    name: "Marketing",
    path: "/marketing",
    icon: CheckCircle
  }]
}, {
  icon: Package,
  title: "Productivity",
  tools: [{
    name: "Personal Expense Tracker",
    path: "/personal-expense",
    icon: CheckCircle
  }]
}, {
  icon: Package,
  title: "Custom",
  tools: [{
    name: "Contact Us",
    path: "/contact",
    icon: PhoneCall
  }]
}];
const Features = () => {
  return <section className="pb-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
          const Icon = feature.icon;
          return <div key={index} className="bg-card rounded-xl border border-border hover:shadow-lg hover:border-primary/50 transition-all overflow-hidden flex h-[180px]">
                {/* Left side - Vertical colored stripe with category name */}
                <div className="w-12 bg-primary flex flex-col items-center justify-center py-4 gap-2">
                  
                  <div className="flex flex-col items-center justify-center flex-1">
                    <span className="text-primary-foreground font-semibold whitespace-nowrap transform -rotate-90 origin-center text-lg">
                      {feature.title}
                    </span>
                  </div>
                </div>
                
                {/* Right side - Tools */}
                <div className="flex-1 p-4 flex flex-col justify-center space-y-1.5">
                  {feature.tools.map((tool, toolIndex) => {
                const ToolIcon = tool.icon;
                return <Link key={toolIndex} to={tool.path} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors group/tool">
                        <ToolIcon className="h-4 w-4 text-foreground group-hover/tool:text-primary transition-colors flex-shrink-0" />
                        <span className="text-foreground group-hover/tool:text-primary transition-colors font-medium text-lg">
                          {tool.name}
                        </span>
                      </Link>;
              })}
                </div>
              </div>;
        })}
        </div>
      </div>
    </section>;
};
export default Features;