import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const ShopIncomeExpense = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Income & Expenditure Tracker</h1>
            <p className="text-lg text-muted-foreground">
              Track shop revenue and expenses for better financial visibility
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Tracking</CardTitle>
              <CardDescription>
                Monitor income, expenses, and profit margins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Income & expenditure tracking tools will be implemented here
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShopIncomeExpense;
