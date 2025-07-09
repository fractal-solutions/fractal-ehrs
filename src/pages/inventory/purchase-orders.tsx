import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const PURCHASE_ORDERS_STORAGE_KEY = 'fractal-ehrs-purchase-orders';

const getStoredPurchaseOrders = () => {
  try {
    const stored = localStorage.getItem(PURCHASE_ORDERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const savePurchaseOrders = (orders) => {
  localStorage.setItem(PURCHASE_ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

export default function PurchaseOrders() {
  const [orders, setOrders] = React.useState(getStoredPurchaseOrders());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [currentOrder, setCurrentOrder] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentOrder({ id: Date.now(), orderDate: '', supplier: '', items: '', totalAmount: 0, status: 'Pending' });
    setDialogOpen(true);
  };

  const handleEditClick = (order) => {
    setIsEditing(true);
    setCurrentOrder(order);
    setDialogOpen(true);
  };

  const handleDeleteClick = (orderId) => {
    const updatedOrders = orders.filter((order) => order.id !== orderId);
    setOrders(updatedOrders);
    savePurchaseOrders(updatedOrders);
  };

  const handleSave = () => {
    if (isEditing) {
      const updatedOrders = orders.map((order) =>
        order.id === currentOrder.id ? currentOrder : order
      );
      setOrders(updatedOrders);
      savePurchaseOrders(updatedOrders);
    } else {
      const updatedOrders = [...orders, currentOrder];
      setOrders(updatedOrders);
      savePurchaseOrders(updatedOrders);
    }
    setDialogOpen(false);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Purchase Orders</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchase orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Purchase Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderDate}</TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>{order.totalAmount}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditClick(order)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(order.id)}>
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
            <DialogTitle>{isEditing ? 'Edit Purchase Order' : 'Add New Purchase Order'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orderDate" className="text-right">Order Date</Label>
              <Input
                id="orderDate"
                type="date"
                value={currentOrder?.orderDate || ''}
                onChange={(e) => setCurrentOrder({ ...currentOrder, orderDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Supplier</Label>
              <Input
                id="supplier"
                value={currentOrder?.supplier || ''}
                onChange={(e) => setCurrentOrder({ ...currentOrder, supplier: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="items" className="text-right">Items</Label>
              <Input
                id="items"
                value={currentOrder?.items || ''}
                onChange={(e) => setCurrentOrder({ ...currentOrder, items: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalAmount" className="text-right">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                value={currentOrder?.totalAmount || 0}
                onChange={(e) => setCurrentOrder({ ...currentOrder, totalAmount: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Input
                id="status"
                value={currentOrder?.status || ''}
                onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value })}
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