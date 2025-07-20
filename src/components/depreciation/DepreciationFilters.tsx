import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Asset } from "@/types/asset";
import { getYear } from "date-fns";

interface DepreciationFiltersProps {
  assets: Asset[];
  onFiltersChange: (filters: DepreciationFilters) => void;
}

export interface DepreciationFilters {
  year: string;
  actType: 'all' | 'Companies Act' | 'IT Act';
  department: string;
  location: string;
  status: 'all' | 'Active' | 'Disposed';
}

export function DepreciationFilters({ assets, onFiltersChange }: DepreciationFiltersProps) {
  const [filters, setFilters] = useState<DepreciationFilters>({
    year: getYear(new Date()).toString(),
    actType: 'all',
    department: 'all',
    location: 'all',
    status: 'Active'
  });

  // Get unique values for dropdowns
  const years = Array.from(new Set([
    ...assets.map(a => getYear(new Date(a.purchaseDate))),
    ...Array.from({ length: 5 }, (_, i) => getYear(new Date()) + i)
  ])).sort((a, b) => b - a);
  
  const departments = Array.from(new Set(assets.map(a => a.department).filter(Boolean)));
  const locations = Array.from(new Set(assets.map(a => a.location).filter(Boolean)));

  const handleFilterChange = (key: keyof DepreciationFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: DepreciationFilters = {
      year: getYear(new Date()).toString(),
      actType: 'all',
      department: 'all',
      location: 'all',
      status: 'Active'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="year">Financial Year</Label>
            <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}-{year + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actType">Act Type</Label>
            <Select value={filters.actType} onValueChange={(value) => handleFilterChange('actType', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select act" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Acts</SelectItem>
                <SelectItem value="Companies Act">Companies Act</SelectItem>
                <SelectItem value="IT Act">IT Act</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={resetFilters} className="h-10">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}