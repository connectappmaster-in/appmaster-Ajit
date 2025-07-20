import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Asset } from '@/types/asset';
import { ArrowRightLeft, Clock, User, Briefcase } from 'lucide-react';

interface AssetMovement {
  id: string;
  assetId: string;
  action: 'Check-out' | 'Check-in' | 'Transfer';
  fromEmployee?: string;
  toEmployee?: string;
  fromProject?: string;
  toProject?: string;
  fromLocation?: string;
  toLocation?: string;
  date: string;
  remarks: string;
  createdBy: string;
}

interface AssetMovementProps {
  asset: Asset;
  onMovementAdded?: () => void;
}

export function AssetMovement({ asset, onMovementAdded }: AssetMovementProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [movementForm, setMovementForm] = useState<{
    action: 'Check-out' | 'Check-in' | 'Transfer';
    toEmployee: string;
    toProject: string;
    toLocation: string;
    remarks: string;
  }>({
    action: 'Check-out',
    toEmployee: '',
    toProject: '',
    toLocation: '',
    remarks: ''
  });

  // Mock data - in real app, fetch from master data
  const employees = [
    { id: '1', name: 'John Doe', employeeId: 'EMP001' },
    { id: '2', name: 'Jane Smith', employeeId: 'EMP002' },
  ];

  const projects = [
    { id: '1', name: 'Digital Transformation', code: 'DT2024' },
    { id: '2', name: 'ERP Implementation', code: 'ERP2024' },
  ];

  const locations = ['Head Office', 'Branch Office', 'Warehouse'];

  // Mock movement history
  const movementHistory: AssetMovement[] = [
    {
      id: '1',
      assetId: asset.id,
      action: 'Check-out',
      toEmployee: 'John Doe (EMP001)',
      date: '2024-01-15',
      remarks: 'Assigned for development work',
      createdBy: 'Admin'
    },
    {
      id: '2', 
      assetId: asset.id,
      action: 'Transfer',
      fromLocation: 'Head Office',
      toLocation: 'Branch Office',
      date: '2024-02-01',
      remarks: 'Office relocation',
      createdBy: 'Admin'
    }
  ];

  const handleSubmit = () => {
    // In real app, save to backend
    const movement: AssetMovement = {
      id: Date.now().toString(),
      assetId: asset.id,
      action: movementForm.action,
      toEmployee: movementForm.toEmployee,
      toProject: movementForm.toProject,
      toLocation: movementForm.toLocation,
      date: new Date().toISOString().split('T')[0],
      remarks: movementForm.remarks,
      createdBy: 'Current User'
    };

    console.log('Asset movement:', movement);
    
    toast({
      title: "Movement Recorded",
      description: `Asset ${movementForm.action.toLowerCase()} recorded successfully.`,
    });

    setMovementForm({
      action: 'Check-out',
      toEmployee: '',
      toProject: '',
      toLocation: '',
      remarks: ''
    });
    setIsOpen(false);
    onMovementAdded?.();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Asset Movement
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                Record Movement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Asset Movement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="action">Action</Label>
                  <Select value={movementForm.action} onValueChange={(value: any) => setMovementForm(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Check-out">Check-out</SelectItem>
                      <SelectItem value="Check-in">Check-in</SelectItem>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(movementForm.action === 'Check-out' || movementForm.action === 'Transfer') && (
                  <div>
                    <Label htmlFor="employee">Assign to Employee</Label>
                    <Select value={movementForm.toEmployee} onValueChange={(value) => setMovementForm(prev => ({ ...prev, toEmployee: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={`${emp.name} (${emp.employeeId})`}>
                            {emp.name} ({emp.employeeId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="project">Assign to Project (Optional)</Label>
                  <Select value={movementForm.toProject} onValueChange={(value) => setMovementForm(prev => ({ ...prev, toProject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={`${project.name} (${project.code})`}>
                          {project.name} ({project.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {movementForm.action === 'Transfer' && (
                  <div>
                    <Label htmlFor="location">Transfer to Location</Label>
                    <Select value={movementForm.toLocation} onValueChange={(value) => setMovementForm(prev => ({ ...prev, toLocation: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={movementForm.remarks}
                    onChange={(e) => setMovementForm(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Add any additional notes..."
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Record Movement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Movement History</h4>
          {movementHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No movement history available.</p>
          ) : (
            <div className="space-y-2">
              {movementHistory.map((movement) => (
                <div key={movement.id} className="flex items-start justify-between p-2 border rounded text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        movement.action === 'Check-out' ? 'default' :
                        movement.action === 'Check-in' ? 'secondary' : 'outline'
                      }>
                        {movement.action}
                      </Badge>
                      <span className="text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(movement.date).toLocaleDateString()}
                      </span>
                    </div>
                    {movement.toEmployee && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        {movement.toEmployee}
                      </div>
                    )}
                    {movement.toProject && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Briefcase className="h-3 w-3" />
                        {movement.toProject}
                      </div>
                    )}
                    {movement.fromLocation && movement.toLocation && (
                      <div className="text-muted-foreground">
                        {movement.fromLocation} → {movement.toLocation}
                      </div>
                    )}
                    {movement.remarks && (
                      <p className="text-muted-foreground italic">{movement.remarks}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}