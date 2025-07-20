import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompanyInfo {
  name: string;
  pan: string;
  gst: string;
  address: string;
  financialYearStart: number; // Month (1-12)
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const STORAGE_KEY = 'asset-manager-company-info';

export function CompanySettings() {
  const { toast } = useToast();
  const [info, setInfo] = useState<CompanyInfo>({
    name: '',
    pan: '',
    gst: '',
    address: '',
    financialYearStart: 4, // Default to April
  });

  // Load company info from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setInfo(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load company info:', error);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
      toast({
        title: "Company information saved",
        description: "Your company details have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving company information",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof CompanyInfo, value: string | number) => {
    setInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              value={info.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pan">PAN Number</Label>
            <Input
              id="pan"
              value={info.pan}
              onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst">GST Number</Label>
            <Input
              id="gst"
              value={info.gst}
              onChange={(e) => handleInputChange('gst', e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fy-start">Financial Year Starts</Label>
            <Select 
              value={info.financialYearStart.toString()} 
              onValueChange={(value) => handleInputChange('financialYearStart', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(month => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Company Address</Label>
          <Textarea
            id="address"
            value={info.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter complete company address"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Company Information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}