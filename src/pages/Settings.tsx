import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanySettings } from '@/components/settings/CompanySettings';
import { DefaultPreferences } from '@/components/settings/DefaultPreferences';
import { MasterData } from '@/components/settings/MasterData';
import { DataBackup } from '@/components/settings/DataBackup';
import { Building2, Settings as SettingsIcon, Database, Download } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system preferences and manage master data
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="master-data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Master Data</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Backup</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="preferences">
          <DefaultPreferences />
        </TabsContent>

        <TabsContent value="master-data">
          <MasterData />
        </TabsContent>

        <TabsContent value="backup">
          <DataBackup />
        </TabsContent>
      </Tabs>
    </div>
  );
}