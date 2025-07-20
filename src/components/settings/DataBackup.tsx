import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAssets } from '@/hooks/useAssets';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DataBackup() {
  const { toast } = useToast();
  const { assets } = useAssets();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const exportAllData = () => {
    try {
      // Gather all data from localStorage
      const allData = {
        assets: assets,
        companyInfo: JSON.parse(localStorage.getItem('asset-manager-company-info') || '{}'),
        preferences: JSON.parse(localStorage.getItem('asset-manager-default-preferences') || '{}'),
        masterData: JSON.parse(localStorage.getItem('asset-manager-master-data') || '{}'),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `asset-manager-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      a.click();
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported successfully",
        description: "Your complete asset management data has been exported.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportAsCSV = () => {
    try {
      if (assets.length === 0) {
        toast({
          title: "No data to export",
          description: "Please add some assets before exporting.",
          variant: "destructive",
        });
        return;
      }

      const headers = [
        'Asset Name',
        'Purchase Date',
        'Capitalization Date',
        'Purchase Value',
        'Location',
        'Department',
        'Status',
        'Disposal Date',
        'Disposal Value',
        'Category',
        'Used For',
        'Useful Life (Years)',
        'Residual Value %',
        'Depreciation Method',
        'Depreciation Rate %',
        'Created At',
        'Updated At'
      ];

      const csvContent = [
        headers.join(','),
        ...assets.map(asset => [
          `"${asset.name}"`,
          asset.purchaseDate,
          asset.capitalizationDate,
          asset.purchaseValue,
          `"${asset.location}"`,
          `"${asset.department}"`,
          asset.status,
          asset.disposalDate || '',
          asset.disposalValue || '',
          `"${asset.categoryName}"`,
          `"${asset.usedFor.join('; ')}"`,
          asset.usefulLifeYears || '',
          asset.residualValuePercent || '',
          asset.depreciationMethod || '',
          asset.depreciationRatePercent || '',
          asset.createdAt,
          asset.updatedAt
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "CSV exported successfully",
        description: "Your asset data has been exported as CSV.",
      });
    } catch (error) {
      toast({
        title: "CSV export failed",
        description: "Unable to export CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a JSON backup file.",
        variant: "destructive",
      });
    }
  };

  const importData = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a backup file to import.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!importedData.assets || !Array.isArray(importedData.assets)) {
          throw new Error('Invalid backup file format');
        }

        // Import data to localStorage
        if (importedData.assets) {
          localStorage.setItem('asset-manager-assets', JSON.stringify(importedData.assets));
        }
        if (importedData.companyInfo) {
          localStorage.setItem('asset-manager-company-info', JSON.stringify(importedData.companyInfo));
        }
        if (importedData.preferences) {
          localStorage.setItem('asset-manager-default-preferences', JSON.stringify(importedData.preferences));
        }
        if (importedData.masterData) {
          localStorage.setItem('asset-manager-master-data', JSON.stringify(importedData.masterData));
        }

        toast({
          title: "Data imported successfully",
          description: "Your backup has been restored. Please refresh the page to see changes.",
        });

        // Clear file selection
        setSelectedFile(null);
        
        // Suggest page reload
        setTimeout(() => {
          if (confirm('Data has been imported successfully. Would you like to refresh the page to see changes?')) {
            window.location.reload();
          }
        }, 2000);
        
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid backup file or corrupted data.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Backup & Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Regular backups are recommended to prevent data loss. Export your data before making major changes.
          </AlertDescription>
        </Alert>

        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Export Data</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportAllData} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export Complete Backup (JSON)
            </Button>
            <Button onClick={exportAsCSV} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export Assets Only (CSV)
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            JSON backup includes all data (assets, settings, master data). CSV export includes only asset data.
          </p>
        </div>

        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Import Data</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="backup-file">Select Backup File (JSON)</Label>
              <Input
                id="backup-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="mt-1"
              />
            </div>
            
            {selectedFile && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Selected file: {selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <Button 
              onClick={importData} 
              disabled={!selectedFile}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Backup Data
            </Button>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Importing will replace all existing data. Make sure to export your current data first.
            </AlertDescription>
          </Alert>
        </div>

        {/* Current Data Info */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Current Data Summary</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Assets: {assets.length} records</p>
            <p>• Active Assets: {assets.filter(a => a.status === 'Active').length}</p>
            <p>• Disposed Assets: {assets.filter(a => a.status === 'Disposed').length}</p>
            <p>• Last Updated: {assets.length > 0 ? format(new Date(Math.max(...assets.map(a => new Date(a.updatedAt).getTime()))), 'PPP') : 'No data'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}