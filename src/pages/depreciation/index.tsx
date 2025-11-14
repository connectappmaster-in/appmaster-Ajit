import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Depreciation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Depreciation</h1>
            <p className="text-lg text-muted-foreground">
              Manage and track asset depreciation schedules
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Depreciation Management</CardTitle>
              <CardDescription>
                Calculate and monitor depreciation for your assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Depreciation tools will be implemented here
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Depreciation;
