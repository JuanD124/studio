'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, writeBatch, query, orderBy, updateDoc } from 'firebase/firestore';
import type { StoredItem, LaundryItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { InvoiceDialog } from './invoice-dialog';
import { StoredItemCard } from './stored-item-card';
import { useToast } from '@/hooks/use-toast';

export default function StorageManager() {
  const [items, setItems] = React.useState<StoredItem[]>([]);
  const [laundryServices, setLaundryServices] = React.useState<LaundryItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false);
  const [invoicingItem, setInvoicingItem] = React.useState<StoredItem | null>(null);
  const [editingItem, setEditingItem] = React.useState<StoredItem | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, 'storedItems'), orderBy('storageDate', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData: StoredItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        itemsData.push({ 
          id: doc.id,
          ...data,
          storageDate: data.storageDate,
        } as StoredItem);
      });
      setItems(itemsData);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const q = query(collection(db, 'laundryItems'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const servicesData: LaundryItem[] = [];
      querySnapshot.forEach((doc) => {
        servicesData.push({ id: doc.id, ...doc.data() } as LaundryItem);
      });
      setLaundryServices(servicesData);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.customerId && item.customerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.itemsDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveItem = async (itemData: Omit<StoredItem, 'id' | 'storageDate'>, id?: string) => {
    try {
      if (id) {
        // Update existing item
        const itemRef = doc(db, 'storedItems', id);
        await updateDoc(itemRef, itemData);
        toast({
          title: "Éxito",
          description: "El artículo ha sido actualizado correctamente.",
        });
      } else {
        // Add new item
        await addDoc(collection(db, 'storedItems'), {
          ...itemData,
          storageDate: new Date().toISOString(),
        });
        toast({
          title: "Éxito",
          description: "El artículo ha sido almacenado correctamente.",
        });
      }
    } catch (error) {
      console.error("Error al guardar el artículo: ", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el artículo.",
        variant: "destructive",
      });
    }
  };


  const handleClaimItem = async (item: StoredItem) => {
    try {
      const batch = writeBatch(db);
      
      const claimedItemRef = doc(db, 'claimedItems', item.id);
      batch.set(claimedItemRef, { ...item, claimedDate: new Date().toISOString() });
      
      const originalItemRef = doc(db, 'storedItems', item.id);
      batch.delete(originalItemRef);
      
      await batch.commit();

      toast({
        title: "Artículo Entregado",
        description: `${item.itemsDescription} ha sido movido a la papelera.`,
      });
    } catch (error) {
      console.error("Error al entregar el artículo: ", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la entrega del artículo.",
        variant: "destructive",
      });
    }
  };
  
  const handleOpenInvoice = (item: StoredItem) => {
    setInvoicingItem(item);
    setIsInvoiceOpen(true);
  };
  
  const handleOpenAddDialog = () => {
    setEditingItem(null);
    setIsAddDialogOpen(true);
  }

  const handleOpenEditDialog = (item: StoredItem) => {
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingItem(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, nombre, cédula, o descripción..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenAddDialog} className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          <span>Almacenar Nuevo Artículo</span>
        </Button>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <StoredItemCard 
              key={item.id}
              item={item}
              onClaim={handleClaimItem}
              onOpenInvoice={handleOpenInvoice}
              onEdit={handleOpenEditDialog}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No se encontraron artículos almacenados.</p>
          <p className="text-sm text-muted-foreground">Intenta ajustar tu búsqueda o añade un nuevo artículo.</p>
        </div>
      )}

      <AddItemDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveItem}
        itemToEdit={editingItem}
        laundryServices={laundryServices}
      />
      <InvoiceDialog
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        item={invoicingItem}
      />
    </div>
  );
}
