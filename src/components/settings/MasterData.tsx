import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Building, Plus, X, Save, FolderOpen, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssetCategory {
  id: string;
  name: string;
  defaultUsefulLife: number;
  depreciationRate: number;
  applicableActs: ('Companies Act' | 'IT Act')[];
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  location: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
  clientName: string;
}

interface MasterData {
  departments: string[];
  locations: string[];
  categories: AssetCategory[];
  employees: Employee[];
  projects: Project[];
}

const STORAGE_KEY = 'asset-manager-master-data';

export function MasterData() {
  const { toast } = useToast();
  const [data, setData] = useState<MasterData>({
    departments: ['IT', 'HR', 'Finance', 'Operations'],
    locations: ['Head Office', 'Branch Office', 'Warehouse'],
    categories: [
      { id: '1', name: 'Computer Equipment', defaultUsefulLife: 3, depreciationRate: 60, applicableActs: ['Companies Act', 'IT Act'] },
      { id: '2', name: 'Office Furniture', defaultUsefulLife: 10, depreciationRate: 10, applicableActs: ['Companies Act'] },
    ],
    employees: [
      { id: '1', name: 'John Doe', employeeId: 'EMP001', department: 'IT', location: 'Head Office' },
      { id: '2', name: 'Jane Smith', employeeId: 'EMP002', department: 'HR', location: 'Branch Office' },
    ],
    projects: [
      { id: '1', name: 'Digital Transformation', code: 'DT2024', clientName: 'ABC Corp' },
      { id: '2', name: 'ERP Implementation', code: 'ERP2024', clientName: 'XYZ Ltd' },
    ]
  });
  
  const [newDepartment, setNewDepartment] = useState('');
  const [newLocation, setNewLocation] = useState('');
  
  // Category form states
  const [newCategory, setNewCategory] = useState({
    name: '',
    defaultUsefulLife: '',
    depreciationRate: '',
    applicableActs: [] as ('Companies Act' | 'IT Act')[]
  });
  
  // Employee form states
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    employeeId: '',
    department: '',
    location: ''
  });
  
  // Project form states
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    clientName: ''
  });

  // Load master data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        // Ensure all arrays exist and are arrays
        setData({
          departments: Array.isArray(parsedData.departments) ? parsedData.departments : ['IT', 'HR', 'Finance', 'Operations'],
          locations: Array.isArray(parsedData.locations) ? parsedData.locations : ['Head Office', 'Branch Office', 'Warehouse'],
          categories: Array.isArray(parsedData.categories) ? parsedData.categories : [
            { id: '1', name: 'Computer Equipment', defaultUsefulLife: 3, depreciationRate: 60, applicableActs: ['Companies Act', 'IT Act'] },
            { id: '2', name: 'Office Furniture', defaultUsefulLife: 10, depreciationRate: 10, applicableActs: ['Companies Act'] },
          ],
          employees: Array.isArray(parsedData.employees) ? parsedData.employees : [
            { id: '1', name: 'John Doe', employeeId: 'EMP001', department: 'IT', location: 'Head Office' },
            { id: '2', name: 'Jane Smith', employeeId: 'EMP002', department: 'HR', location: 'Branch Office' },
          ],
          projects: Array.isArray(parsedData.projects) ? parsedData.projects : [
            { id: '1', name: 'Digital Transformation', code: 'DT2024', clientName: 'ABC Corp' },
            { id: '2', name: 'ERP Implementation', code: 'ERP2024', clientName: 'XYZ Ltd' },
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load master data:', error);
      // Keep default values if there's an error
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      toast({
        title: "Master data saved",
        description: "All master data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving master data",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const addDepartment = () => {
    if (newDepartment.trim() && !data.departments.includes(newDepartment.trim())) {
      setData(prev => ({
        ...prev,
        departments: [...prev.departments, newDepartment.trim()]
      }));
      setNewDepartment('');
    }
  };

  const removeDepartment = (dept: string) => {
    setData(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== dept)
    }));
  };

  const addLocation = () => {
    if (newLocation.trim() && !data.locations.includes(newLocation.trim())) {
      setData(prev => ({
        ...prev,
        locations: [...prev.locations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }));
  };

  // Category functions
  const addCategory = () => {
    if (newCategory.name.trim() && newCategory.defaultUsefulLife && newCategory.depreciationRate) {
      const category: AssetCategory = {
        id: Date.now().toString(),
        name: newCategory.name.trim(),
        defaultUsefulLife: Number(newCategory.defaultUsefulLife),
        depreciationRate: Number(newCategory.depreciationRate),
        applicableActs: newCategory.applicableActs
      };
      setData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
      setNewCategory({ name: '', defaultUsefulLife: '', depreciationRate: '', applicableActs: [] });
    }
  };

  const removeCategory = (id: string) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id)
    }));
  };

  // Employee functions
  const addEmployee = () => {
    if (newEmployee.name.trim() && newEmployee.employeeId.trim()) {
      const employee: Employee = {
        id: Date.now().toString(),
        name: newEmployee.name.trim(),
        employeeId: newEmployee.employeeId.trim(),
        department: newEmployee.department,
        location: newEmployee.location
      };
      setData(prev => ({
        ...prev,
        employees: [...prev.employees, employee]
      }));
      setNewEmployee({ name: '', employeeId: '', department: '', location: '' });
    }
  };

  const removeEmployee = (id: string) => {
    setData(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== id)
    }));
  };

  // Project functions
  const addProject = () => {
    if (newProject.name.trim() && newProject.code.trim()) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name.trim(),
        code: newProject.code.trim(),
        clientName: newProject.clientName.trim()
      };
      setData(prev => ({
        ...prev,
        projects: [...prev.projects, project]
      }));
      setNewProject({ name: '', code: '', clientName: '' });
    }
  };

  const removeProject = (id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Departments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Departments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Enter department name"
              onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
            />
            <Button onClick={addDepartment} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
            <div className="flex flex-wrap gap-2">
              {(data.departments || []).map((dept) => (
              <Badge key={dept} variant="secondary" className="flex items-center gap-1">
                {dept}
                <button
                  onClick={() => removeDepartment(dept)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Enter location name"
              onKeyPress={(e) => e.key === 'Enter' && addLocation()}
            />
            <Button onClick={addLocation} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
            <div className="flex flex-wrap gap-2">
              {(data.locations || []).map((location) => (
              <Badge key={location} variant="secondary" className="flex items-center gap-1">
                {location}
                <button
                  onClick={() => removeLocation(location)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Asset Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <Input
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Category name"
            />
            <Input
              type="number"
              value={newCategory.defaultUsefulLife}
              onChange={(e) => setNewCategory(prev => ({ ...prev, defaultUsefulLife: e.target.value }))}
              placeholder="Useful life (years)"
            />
            <Input
              type="number"
              value={newCategory.depreciationRate}
              onChange={(e) => setNewCategory(prev => ({ ...prev, depreciationRate: e.target.value }))}
              placeholder="Depreciation rate (%)"
            />
            <div className="flex gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="companies-act"
                  checked={newCategory.applicableActs.includes('Companies Act')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNewCategory(prev => ({ 
                        ...prev, 
                        applicableActs: [...prev.applicableActs, 'Companies Act'] 
                      }));
                    } else {
                      setNewCategory(prev => ({ 
                        ...prev, 
                        applicableActs: prev.applicableActs.filter(act => act !== 'Companies Act') 
                      }));
                    }
                  }}
                />
                <Label htmlFor="companies-act" className="text-xs">Companies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="it-act"
                  checked={newCategory.applicableActs.includes('IT Act')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNewCategory(prev => ({ 
                        ...prev, 
                        applicableActs: [...prev.applicableActs, 'IT Act'] 
                      }));
                    } else {
                      setNewCategory(prev => ({ 
                        ...prev, 
                        applicableActs: prev.applicableActs.filter(act => act !== 'IT Act') 
                      }));
                    }
                  }}
                />
                <Label htmlFor="it-act" className="text-xs">IT Act</Label>
              </div>
            </div>
            <Button onClick={addCategory} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {(data.categories || []).map((category) => (
              <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{category.defaultUsefulLife} years</span>
                  <span className="text-sm text-muted-foreground">{category.depreciationRate}%</span>
                  <div className="flex gap-1">
                    {category.applicableActs.map(act => (
                      <Badge key={act} variant="outline" className="text-xs">
                        {act === 'Companies Act' ? 'CA' : 'IT'}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCategory(category.id)}
                  className="hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <Input
              value={newEmployee.name}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Employee name"
            />
            <Input
              value={newEmployee.employeeId}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, employeeId: e.target.value }))}
              placeholder="Employee ID"
            />
            <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee(prev => ({ ...prev, department: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {(data.departments || []).map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newEmployee.location} onValueChange={(value) => setNewEmployee(prev => ({ ...prev, location: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {(data.locations || []).map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addEmployee} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {(data.employees || []).map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-sm text-muted-foreground">{employee.employeeId}</span>
                  <Badge variant="outline">{employee.department}</Badge>
                  <Badge variant="outline">{employee.location}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEmployee(employee.id)}
                  className="hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              value={newProject.name}
              onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Project name"
            />
            <Input
              value={newProject.code}
              onChange={(e) => setNewProject(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Project code"
            />
            <Input
              value={newProject.clientName}
              onChange={(e) => setNewProject(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Client name"
            />
            <Button onClick={addProject} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {(data.projects || []).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-sm text-muted-foreground">{project.code}</span>
                  <Badge variant="outline">{project.clientName}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(project.id)}
                  className="hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Master Data
        </Button>
      </div>
    </div>
  );
}