import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Assets = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Assets</h1>
            <p className="text-lg text-muted-foreground">
              Track and manage IT assets and equipment
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Asset Management</CardTitle>
              <CardDescription>
                Monitor hardware, software, and equipment inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Asset management tools will be implemented here
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assets;
