import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const INVENTORY_STORAGE_KEY = 'fractal-ehrs-inventory';

const getStoredInventory = () => {
  try {
    const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveInventory = (inventory) => {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
};

export default function StockControl() {
  const [inventory, setInventory] = React.useState(getStoredInventory());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentItem({ id: Date.now(), name: '', sku: '', quantity: 0, unit: '', cost: 0 });
    setDialogOpen(true);
  };

  const handleEditClick = (item) => {
    setIsEditing(true);
    setCurrentItem(item);
    setDialogOpen(true);
  };

  const handleDeleteClick = (itemId) => {
    const updatedInventory = inventory.filter((item) => item.id !== itemId);
    setInventory(updatedInventory);
    saveInventory(updatedInventory);
  };

  const handleSave = () => {
    if (isEditing) {
      const updatedInventory = inventory.map((item) =>
        item.id === currentItem.id ? currentItem : item
      );
      setInventory(updatedInventory);
      saveInventory(updatedInventory);
    } else {
      const updatedInventory = [...inventory, currentItem];
      setInventory(updatedInventory);
      saveInventory(updatedInventory);
    }
    setDialogOpen(false);
  };

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stock Control</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.cost}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditClick(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(item.id)}>
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
            <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={currentItem?.name || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">SKU</Label>
              <Input
                id="sku"
                value={currentItem?.sku || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, sku: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={currentItem?.quantity || 0}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">Unit</Label>
              <Input
                id="unit"
                value={currentItem?.unit || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, unit: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost" className="text-right">Cost</Label>
              <Input
                id="cost"
                type="number"
                value={currentItem?.cost || 0}
                onChange={(e) => setCurrentItem({ ...currentItem, cost: parseFloat(e.target.value) })}
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