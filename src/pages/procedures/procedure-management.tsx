
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const PROCEDURES_STORAGE_KEY = 'fractal-ehrs-procedures';

const getStoredProcedures = () => {
  try {
    const stored = localStorage.getItem(PROCEDURES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveProcedures = (procedures) => {
  localStorage.setItem(PROCEDURES_STORAGE_KEY, JSON.stringify(procedures));
};

export default function ProcedureManagement() {
  const [procedures, setProcedures] = React.useState(getStoredProcedures());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [currentProcedure, setCurrentProcedure] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentProcedure({ label: '', value: '', cost: '' });
    setDialogOpen(true);
  };

  const handleEditClick = (procedure) => {
    setIsEditing(true);
    setCurrentProcedure(procedure);
    setDialogOpen(true);
  };

  const handleDeleteClick = (procedureValue) => {
    const updatedProcedures = procedures.filter((p) => p.value !== procedureValue);
    setProcedures(updatedProcedures);
    saveProcedures(updatedProcedures);
  };

  const handleSave = () => {
    if (isEditing) {
      const updatedProcedures = procedures.map((p) =>
        p.value === currentProcedure.value ? currentProcedure : p
      );
      setProcedures(updatedProcedures);
      saveProcedures(updatedProcedures);
    } else {
      const newProcedure = { ...currentProcedure, value: currentProcedure.label.replace(/\s+/g, '-').toLowerCase() };
      const updatedProcedures = [...procedures, newProcedure];
      setProcedures(updatedProcedures);
      saveProcedures(updatedProcedures);
    }
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Procedures</CardTitle>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Procedure
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {procedures.map((procedure) => (
              <TableRow key={procedure.value}>
                <TableCell>{procedure.label}</TableCell>
                <TableCell>{procedure.value}</TableCell>
                <TableCell>{procedure.cost}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditClick(procedure)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(procedure.value)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Procedure' : 'Add Procedure'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Label"
              value={currentProcedure?.label || ''}
              onChange={(e) => setCurrentProcedure({ ...currentProcedure, label: e.target.value })}
            />
            <Input
              placeholder="Cost"
              type="number"
              value={currentProcedure?.cost || ''}
              onChange={(e) => setCurrentProcedure({ ...currentProcedure, cost: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
