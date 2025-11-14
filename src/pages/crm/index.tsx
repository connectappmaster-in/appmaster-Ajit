import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const CRM = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">CRM</h1>
            <p className="text-lg text-muted-foreground">
              Manage customer relationships and sales pipeline
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Relationship Management</CardTitle>
              <CardDescription>
                Track leads, deals, and customer interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                CRM tools will be implemented here
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CRM;
