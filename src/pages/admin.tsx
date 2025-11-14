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

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
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
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to App
            </Button>
          </div>

          <Tabs value={activeTab} className="space-y-6">
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

            <TabsContent value="dashboard" className="space-y-6">
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
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">System Settings</h3>
                <p className="text-muted-foreground">Settings configuration coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="integrations">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Integrations</h3>
                <p className="text-muted-foreground">Integrations management coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
