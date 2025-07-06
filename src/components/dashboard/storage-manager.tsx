'use client';

import * as React from 'react';
import { initialStoredItems } from '@/lib/data';
import type { StoredItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, CalendarDays, Clock, Package, PackageCheck } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { formatDistanceToNow } from 'date-fns';

export default function StorageManager() {
  const [items, setItems] = React.useState<StoredItem[]>(initialStoredItems);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const filteredItems = items.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm) ||
      item.itemsDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (newItemData: Omit<StoredItem, 'id' | 'storageDate'>) => {
    const newItem: StoredItem = {
      id: `s${Date.now()}`,
      ...newItemData,
      storageDate: new Date().toISOString(),
    };
    setItems([newItem, ...items]);
  };

  const handleClaimItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };
  
  const getStorageDuration = (date: string) => {
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
        return "Invalid date";
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          <span>Store New Item</span>
        </Button>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="flex flex-col transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center justify-between">
                  <span>{item.customerName}</span>
                   <Badge variant="secondary">ID: {item.id}</Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-2">
                    <Package className="w-4 h-4" />
                    {item.itemsDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>Stored on: {new Date(item.storageDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Duration: {getStorageDuration(item.storageDate)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => handleClaimItem(item.id)}>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Mark as Claimed
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No stored items found.</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or adding a new item.</p>
        </div>
      )}

      <AddItemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddItem={handleAddItem}
      />
    </div>
  );
}
