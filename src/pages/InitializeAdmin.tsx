import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InitializeAdmin = () => {
  const [email, setEmail] = useState("deepak.dongare@realthingks.com");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('initialize-super-admin', {
        body: { email, secret },
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: data.message || "Super admin initialized successfully",
      });

      // Clear form
      setEmail("");
      setSecret("");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize super admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            <CardTitle>Initialize Super Admin</CardTitle>
          </div>
          <CardDescription>
            Bootstrap the first super admin account. Use the initialization secret to promote a user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInitialize} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret">Initialization Secret</Label>
              <Input
                id="secret"
                type="password"
                placeholder="Enter the secret key"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use "CHANGE_ME_IN_PRODUCTION" for development
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Initialize Super Admin
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitializeAdmin;
