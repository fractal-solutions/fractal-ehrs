import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const SUPPLIERS_STORAGE_KEY = 'fractal-ehrs-suppliers';

const getStoredSuppliers = () => {
  try {
    const stored = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSuppliers = (suppliers) => {
  localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers));
};

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = React.useState(getStoredSuppliers());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [currentSupplier, setCurrentSupplier] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentSupplier({ id: Date.now(), name: '', contactPerson: '', phone: '', email: '' });
    setDialogOpen(true);
  };

  const handleEditClick = (supplier) => {
    setIsEditing(true);
    setCurrentSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDeleteClick = (supplierId) => {
    const updatedSuppliers = suppliers.filter((supplier) => supplier.id !== supplierId);
    setSuppliers(updatedSuppliers);
    saveSuppliers(updatedSuppliers);
  };

  const handleSave = () => {
    if (isEditing) {
      const updatedSuppliers = suppliers.map((supplier) =>
        supplier.id === currentSupplier.id ? currentSupplier : supplier
      );
      setSuppliers(updatedSuppliers);
      saveSuppliers(updatedSuppliers);
    } else {
      const updatedSuppliers = [...suppliers, currentSupplier];
      setSuppliers(updatedSuppliers);
      saveSuppliers(updatedSuppliers);
    }
    setDialogOpen(false);
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Supplier Management</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditClick(supplier)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(supplier.id)}>
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
            <DialogTitle>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={currentSupplier?.name || ''}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactPerson" className="text-right">Contact Person</Label>
              <Input
                id="contactPerson"
                value={currentSupplier?.contactPerson || ''}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, contactPerson: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input
                id="phone"
                value={currentSupplier?.phone || ''}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentSupplier?.email || ''}
                onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                className="col-span-3"
              />
            </div>
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