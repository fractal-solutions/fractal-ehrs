import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableHead, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const DELIVERY_NOTES_STORAGE_KEY = 'fractal-ehrs-delivery-notes';

const getStoredDeliveryNotes = () => {
  try {
    const stored = localStorage.getItem(DELIVERY_NOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveDeliveryNotes = (notes) => {
  localStorage.setItem(DELIVERY_NOTES_STORAGE_KEY, JSON.stringify(notes));
};

export default function DeliveryNotes() {
  const [notes, setNotes] = React.useState(getStoredDeliveryNotes());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [currentNote, setCurrentNote] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentNote({ id: Date.now(), date: '', supplier: '', items: '', receivedBy: '' });
    setDialogOpen(true);
  };

  const handleEditClick = (note) => {
    setIsEditing(true);
    setCurrentNote(note);
    setDialogOpen(true);
  };

  const handleDeleteClick = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    saveDeliveryNotes(updatedNotes);
  };

  const handleSave = () => {
    if (isEditing) {
      const updatedNotes = notes.map((note) =>
        note.id === currentNote.id ? currentNote : note
      );
      setNotes(updatedNotes);
      saveDeliveryNotes(updatedNotes);
    } else {
      const updatedNotes = [...notes, currentNote];
      setNotes(updatedNotes);
      saveDeliveryNotes(updatedNotes);
    }
    setDialogOpen(false);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.receivedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Delivery Notes</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search delivery notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Delivery Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Received By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotes.map((note) => (
              <TableRow key={note.id}>
                <TableCell>{note.date}</TableCell>
                <TableCell>{note.supplier}</TableCell>
                <TableCell>{note.items}</TableCell>
                <TableCell>{note.receivedBy}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditClick(note)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(note.id)}>
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
            <DialogTitle>{isEditing ? 'Edit Delivery Note' : 'Add New Delivery Note'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="date"
                value={currentNote?.date || ''}
                onChange={(e) => setCurrentNote({ ...currentNote, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Supplier</Label>
              <Input
                id="supplier"
                value={currentNote?.supplier || ''}
                onChange={(e) => setCurrentNote({ ...currentNote, supplier: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="items" className="text-right">Items</Label>
              <Input
                id="items"
                value={currentNote?.items || ''}
                onChange={(e) => setCurrentNote({ ...currentNote, items: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receivedBy" className="text-right">Received By</Label>
              <Input
                id="receivedBy"
                value={currentNote?.receivedBy || ''}
                onChange={(e) => setCurrentNote({ ...currentNote, receivedBy: e.target.value })}
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