import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { SubscriptionsManagement } from "@/components/admin/SubscriptionsManagement";
import { BillingManagement } from "@/components/admin/BillingManagement";
import { ToolsAccess } from "@/components/admin/ToolsAccess";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { InsightsDashboard } from "@/components/admin/InsightsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Menu } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeTab = searchParams.get("tab") || "dashboard";

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      // Check if user is admin
      const { data: roles, error } = await supabase
        // @ts-ignore - Types will be regenerated after migration
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const hasAdminRole = roles?.some((r: any) => r.role === 'admin' || r.role === 'super_admin');
      
      if (!hasAdminRole) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 w-full lg:w-auto min-w-0">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Desktop header */}
            <div className="hidden lg:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-2">Manage your application and monitor key metrics</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
              >
                Back to App
              </Button>
            </div>

            <Tabs value={activeTab} className="space-y-4 lg:space-y-6">
              <TabsList className="hidden">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-4 lg:space-y-6 mt-4 lg:mt-0">
                <DashboardStats />
              </TabsContent>

              <TabsContent value="users">
                <UsersManagement />
              </TabsContent>

              <TabsContent value="subscriptions">
                <SubscriptionsManagement />
              </TabsContent>

              <TabsContent value="billing">
                <BillingManagement />
              </TabsContent>

              <TabsContent value="tools">
                <ToolsAccess />
              </TabsContent>

              <TabsContent value="insights">
                <InsightsDashboard />
              </TabsContent>

              <TabsContent value="logs">
                <AuditLogs />
              </TabsContent>

              <TabsContent value="settings">
                <div className="bg-card rounded-lg border border-border p-4 lg:p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">System Settings</h3>
                  <p className="text-sm text-muted-foreground">Settings configuration coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="integrations">
                <div className="bg-card rounded-lg border border-border p-4 lg:p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Integrations</h3>
                  <p className="text-sm text-muted-foreground">Integrations management coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
