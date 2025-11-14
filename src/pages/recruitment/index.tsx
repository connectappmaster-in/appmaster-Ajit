import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Recruitment = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Recruitment</h1>
            <p className="text-lg text-muted-foreground">
              Manage job postings, candidates, and hiring pipeline
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recruitment Management</CardTitle>
              <CardDescription>
                Streamline your hiring process from application to onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Recruitment tools will be implemented here
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Recruitment;
