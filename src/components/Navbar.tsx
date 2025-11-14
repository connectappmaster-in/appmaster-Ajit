import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Menu, LogOut, User, Settings, ShieldAlert, TrendingDown, FileText, Clock, UserPlus, Ticket, CreditCard, Laptop, Store, Box, Target, CheckCircle, PhoneCall } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const productCategories = [
  {
    title: "Finance",
    items: [
      { name: "Depreciation", path: "/tools/depreciation", icon: TrendingDown },
      { name: "Invoicing", path: "/tools/invoicing", icon: FileText }
    ]
  },
  {
    title: "HR",
    items: [
      { name: "Attendance", path: "/tools/attendance", icon: Clock },
      { name: "Recruitment", path: "/tools/recruitment", icon: UserPlus }
    ]
  },
  {
    title: "IT",
    items: [
      { name: "Tickets Handling", path: "/tools/tickets", icon: Ticket },
      { name: "Subscriptions", path: "/tools/subscriptions", icon: CreditCard },
      { name: "Assets", path: "/tools/assets", icon: Laptop }
    ]
  },
  {
    title: "Shop",
    items: [
      { name: "Income & Expenditure Tracker", path: "/tools/shop-income-expense", icon: Store }
    ]
  },
  {
    title: "Manufacturing",
    items: [
      { name: "Inventory", path: "/tools/inventory", icon: Box }
    ]
  },
  {
    title: "Sales",
    items: [
      { name: "CRM", path: "/tools/crm", icon: Target }
    ]
  },
  {
    title: "Marketing",
    items: [
      { name: "Marketing", path: "/tools/marketing", icon: CheckCircle }
    ]
  },
  {
    title: "Productivity",
    items: [
      { name: "Personal Expense Tracker", path: "/tools/personal-expense", icon: CheckCircle }
    ]
  },
  {
    title: "Custom",
    items: [
      { name: "Contact Us", path: "/tools/contact", icon: PhoneCall }
    ]
  }
];
const Navbar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const navigate = useNavigate();
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setUserRole('user');
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const fetchUserRole = async (userId: string) => {
    try {
      // @ts-ignore - Types will be regenerated after migration
      const {
        data,
        error
      } = await supabase
      // @ts-ignore
      .from('user_roles').select('role').eq('user_id', userId).single();
      if (error || !data) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
        return;
      }

      // @ts-ignore
      setUserRole(data.role || 'user');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    }
  };
  const handleLogout = async () => {
    try {
      // Clear local state first
      setUser(null);
      setUserRole('user');

      // Sign out from Supabase
      const {
        error
      } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }

      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate to login even if there's an error
      navigate("/login");
    }
  };
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };
  return <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50 overflow-hidden">
      <div className="w-full px-8 overflow-hidden">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src={logo} alt="AppMaster" className="h-14 w-auto" />
            </Link>
            <div className="hidden md:flex">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-sm font-medium bg-transparent">
                      Products
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[800px] p-6 bg-popover">
                        <div className="grid grid-cols-3 gap-6">
                          {productCategories.map((category, idx) => (
                            <div key={idx} className="space-y-3 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}>
                              <h4 className="font-semibold text-sm text-primary mb-2">
                                {category.title}
                              </h4>
                              <ul className="space-y-2">
                                {category.items.map((item, itemIdx) => {
                                  const Icon = item.icon;
                                  return (
                                    <li key={itemIdx}>
                                      <NavigationMenuLink asChild>
                                        <Link
                                          to={item.path}
                                          className={cn(
                                            "flex items-center gap-2 p-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground group"
                                          )}
                                        >
                                          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                          <span className="text-foreground group-hover:text-primary">
                                            {item.name}
                                          </span>
                                        </Link>
                                      </NavigationMenuLink>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full z-50">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[60]" align="end" forceMount sideOffset={8}>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {(userRole === 'admin' || userRole === 'super_admin') && <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    </>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <>
                <Button variant="ghost" className="hidden md:inline-flex" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button className="bg-primary hover:bg-primary-glow text-primary-foreground" onClick={() => navigate("/login")}>
                  Start Free
                </Button>
              </>}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>;
};
export default Navbar;