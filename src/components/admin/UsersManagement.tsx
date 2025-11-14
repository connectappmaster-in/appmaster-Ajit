import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Shield, ShieldAlert, User } from "lucide-react";

export const UsersManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-all-users');
      if (error) throw error;
      return data;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // @ts-ignore - types will be regenerated after migration
      const { data: role } = await supabase
        // @ts-ignore
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      // @ts-ignore
      return { ...user, role: role?.role || 'user' };
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const { data, error } = await supabase.functions.invoke('manage-user-role', {
        body: { targetUserId: userId, newRole },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <ShieldAlert className="h-4 w-4 mr-1 text-destructive" />;
      case 'admin':
        return <Shield className="h-4 w-4 mr-1 text-primary" />;
      default:
        return <User className="h-4 w-4 mr-1 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Users Management</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isSuperAdmin ? "Manage user roles and permissions" : "View user information"}
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user: any) => {
            const userRole = user.user_roles?.[0]?.role || 'user';
            const isCurrentUser = user.user_id === currentUser?.id;

            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name}
                  {isCurrentUser && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      You
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {isSuperAdmin && !isCurrentUser ? (
                    <Select
                      value={userRole}
                      onValueChange={(newRole) => handleRoleChange(user.user_id, newRole)}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue>
                          <div className="flex items-center">
                            {getRoleIcon(userRole)}
                            <span className="capitalize">{userRole.replace('_', ' ')}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center">
                            {getRoleIcon('user')}
                            <span>User</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center">
                            {getRoleIcon('admin')}
                            <span>Admin</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="super_admin">
                          <div className="flex items-center">
                            {getRoleIcon('super_admin')}
                            <span>Super Admin</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={getRoleBadgeVariant(userRole)}>
                      <div className="flex items-center">
                        {getRoleIcon(userRole)}
                        <span className="capitalize">{userRole.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.last_login ? format(new Date(user.last_login), 'PPp') : 'Never'}
                </TableCell>
                <TableCell>{format(new Date(user.created_at), 'PP')}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
