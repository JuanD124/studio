'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, getDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { StoredItem, LaundryItem, ClaimedItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { InvoiceDialog } from './invoice-dialog';
import { StoredItemCard } from './stored-item-card';

export default function StorageManager() {
  const [items, setItems] = React.useState<StoredItem[]>([]);
  const [laundryServices, setLaundryServices] = React.useState<LaundryItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false);
  const [invoicingItem, setInvoicingItem] = React.useState<StoredItem | null>(null);

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
    const unsubscribe = onSnapshot(collection(db, 'laundryItems'), (querySnapshot) => {
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
      item.id.toString().includes(searchTerm) ||
      item.itemsDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.battalion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contingent?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = async (newItemData: Omit<StoredItem, 'id' | 'storageDate'>) => {
    try {
      await addDoc(collection(db, 'storedItems'), {
        ...newItemData,
        storageDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleClaimItem = async (id: string) => {
    const itemRef = doc(db, 'storedItems', id);
    try {
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
            const itemToClaimData = itemSnap.data();
            const claimedItemPayload: ClaimedItem = {
                id: itemSnap.id,
                customerName: itemToClaimData.customerName,
                rank: itemToClaimData.rank,
                battalion: itemToClaimData.battalion,
                contingent: itemToClaimData.contingent,
                ticketColor: itemToClaimData.ticketColor,
                itemsDescription: itemToClaimData.itemsDescription,
                storageDate: itemToClaimData.storageDate,
                storagePrice: itemToClaimData.storagePrice,
                laundryItems: itemToClaimData.laundryItems,
                totalPrice: itemToClaimData.totalPrice,
                claimedDate: new Date().toISOString(),
            };
            await addDoc(collection(db, 'claimedItems'), claimedItemPayload);
            await deleteDoc(itemRef);
        } else {
            console.error("No such document to claim!");
        }
    } catch (error) {
        console.error("Error claiming item: ", error);
    }
  };
  
  const handleOpenInvoice = (item: StoredItem) => {
    setInvoicingItem(item);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, nombre, descripción, rango..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
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
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No se encontraron artículos almacenados.</p>
          <p className="text-sm text-muted-foreground">Intenta ajustar tu búsqueda o añadir un nuevo artículo.</p>
        </div>
      )}

      <AddItemDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddItem={handleAddItem}
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
