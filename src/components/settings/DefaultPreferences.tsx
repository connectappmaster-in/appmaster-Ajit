import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DefaultPreferences {
  depreciationMethod: 'SLM' | 'WDV';
  residualValuePercent: number;
  currencySymbol: string;
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
}

const STORAGE_KEY = 'asset-manager-default-preferences';

export function DefaultPreferences() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<DefaultPreferences>({
    depreciationMethod: 'SLM',
    residualValuePercent: 5,
    currencySymbol: '₹',
    dateFormat: 'dd/mm/yyyy',
  });

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      toast({
        title: "Preferences saved",
        description: "Your default preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof DefaultPreferences, value: string | number) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Default Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="depreciation-method">Default Depreciation Method</Label>
            <Select 
              value={preferences.depreciationMethod} 
              onValueChange={(value: 'SLM' | 'WDV') => handleInputChange('depreciationMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SLM">Straight Line Method (SLM)</SelectItem>
                <SelectItem value="WDV">Written Down Value (WDV)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="residual-value">Default Residual Value %</Label>
            <Input
              id="residual-value"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={preferences.residualValuePercent}
              onChange={(e) => handleInputChange('residualValuePercent', parseFloat(e.target.value) || 0)}
              placeholder="5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency Symbol</Label>
            <Select 
              value={preferences.currencySymbol} 
              onValueChange={(value) => handleInputChange('currencySymbol', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="₹">₹ (Indian Rupee)</SelectItem>
                <SelectItem value="$">$ (US Dollar)</SelectItem>
                <SelectItem value="€">€ (Euro)</SelectItem>
                <SelectItem value="£">£ (British Pound)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select 
              value={preferences.dateFormat} 
              onValueChange={(value: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd') => handleInputChange('dateFormat', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY (31/12/2024)</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY (12/31/2024)</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (2024-12-31)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}