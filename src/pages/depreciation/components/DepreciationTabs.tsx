import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CompaniesActTab } from "./CompaniesActTab";
import { IncomeTaxActTab } from "./IncomeTaxActTab";

export const DepreciationTabs = () => {
  return (
    <Tabs defaultValue="companies" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="companies">Companies Act</TabsTrigger>
        <TabsTrigger value="income-tax">Income Tax Act</TabsTrigger>
      </TabsList>
      
      <TabsContent value="companies" className="mt-6">
        <Card className="p-6">
          <CompaniesActTab />
        </Card>
      </TabsContent>
      
      <TabsContent value="income-tax" className="mt-6">
        <Card className="p-6">
          <IncomeTaxActTab />
        </Card>
      </TabsContent>
    </Tabs>
  );
};
