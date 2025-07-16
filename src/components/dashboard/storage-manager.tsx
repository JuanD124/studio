'use client';

import * as React from 'react';
import { db, isFirebaseConfigInvalid } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, writeBatch, query, orderBy, updateDoc, arrayUnion } from 'firebase/firestore';
import type { StoredItem, LaundryItem, ClaimedItem, Payment, IncomeEntry } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PlusCircle, Search } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { InvoiceDialog } from './invoice-dialog';
import { StoredItemCard } from './stored-item-card';
import { AddPaymentDialog } from './add-payment-dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function StorageManager() {
  const [items, setItems] = React.useState<StoredItem[]>([]);
  const [laundryServices, setLaundryServices] = React.useState<LaundryItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [invoicingItem, setInvoicingItem] = React.useState<StoredItem | null>(null);
  const [editingItem, setEditingItem] = React.useState<StoredItem | null>(null);
  const [paymentItem, setPaymentItem] = React.useState<StoredItem | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!db) return;

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
    if (!db) return;

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

  const handleSaveItem = React.useCallback(async (itemData: Omit<StoredItem, 'id' | 'storageDate' | 'payments' | 'remainingBalance'>, id?: string) => {
    if (!db) return;
    try {
      if (id) {
        // When editing, we need to preserve payments and recalculate remaining balance
        const existingItem = items.find(i => i.id === id);
        if (!existingItem) throw new Error("Item no encontrado");

        const totalPaid = existingItem.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const updatedData = {
          ...itemData,
          payments: existingItem.payments || [],
          remainingBalance: itemData.totalPrice - totalPaid,
        };
        const itemRef = doc(db, 'storedItems', id);
        await updateDoc(itemRef, updatedData);
        toast({
          title: "Éxito",
          description: "El artículo ha sido actualizado correctamente.",
        });
      } else {
        // When creating a new item
        const newItemData: Omit<StoredItem, 'id'> = {
          ...itemData,
          storageDate: new Date().toISOString(),
          payments: [],
          remainingBalance: itemData.totalPrice,
        };
        await addDoc(collection(db, 'storedItems'), newItemData);
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
  }, [items, toast]);

  const handleSavePayment = React.useCallback(async (itemId: string, amount: number) => {
    if (!db) return;

    const itemRef = doc(db, 'storedItems', itemId);
    const incomeEntryRef = doc(collection(db, 'incomeEntries'));
    const item = items.find(i => i.id === itemId);

    if (!item) {
        toast({ title: "Error", description: "Artículo no encontrado.", variant: "destructive" });
        return;
    }

    try {
        const batch = writeBatch(db);

        const newPayment: Payment = {
            amount,
            date: new Date().toISOString()
        };

        const newRemainingBalance = item.remainingBalance - amount;

        // Update stored item with new payment and remaining balance
        batch.update(itemRef, {
            payments: arrayUnion(newPayment),
            remainingBalance: newRemainingBalance,
        });

        // Create a new income entry
        const incomeEntry: IncomeEntry = {
            amount,
            date: new Date().toISOString(),
            itemId: item.id,
            customerName: item.customerName,
            type: 'Abono',
        };
        batch.set(incomeEntryRef, incomeEntry);

        await batch.commit();
        toast({ title: "Éxito", description: "Abono registrado correctamente." });
    } catch (error) {
        console.error("Error al registrar el abono: ", error);
        toast({ title: "Error", description: "No se pudo registrar el abono.", variant: "destructive" });
    }
}, [items, toast]);

  const handleClaimItem = React.useCallback(async (item: StoredItem) => {
    if (!db) return;
    try {
      const batch = writeBatch(db);
      
      const originalItemRef = doc(db, 'storedItems', item.id);
      const claimedItemRef = doc(db, 'claimedItems', item.id);

      const claimedItemData: ClaimedItem = {
          ...item,
          claimedDate: new Date().toISOString() 
      };
      
      batch.set(claimedItemRef, claimedItemData);
      
      // If there's a remaining balance, create an income entry for it
      if (item.remainingBalance > 0) {
        const finalPaymentEntryRef = doc(collection(db, 'incomeEntries'));
        const finalIncomeEntry: IncomeEntry = {
            amount: item.remainingBalance,
            date: new Date().toISOString(),
            itemId: item.id,
            customerName: item.customerName,
            type: 'Entrega'
        };
        batch.set(finalPaymentEntryRef, finalIncomeEntry);
      }

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
  }, [toast]);
  
  const handleOpenInvoice = React.useCallback((item: StoredItem) => {
    setInvoicingItem(item);
    setIsInvoiceOpen(true);
  }, []);
  
  const handleOpenAddDialog = React.useCallback(() => {
    setEditingItem(null);
    setIsAddDialogOpen(true);
  }, []);

  const handleOpenEditDialog = React.useCallback((item: StoredItem) => {
    setEditingItem(item);
    setIsAddDialogOpen(true);
  }, []);

  const handleOpenPaymentDialog = React.useCallback((item: StoredItem) => {
    setPaymentItem(item);
    setIsPaymentDialogOpen(true);
  }, []);

  const handleCloseDialogs = React.useCallback(() => {
    setIsAddDialogOpen(false);
    setEditingItem(null);
    setIsPaymentDialogOpen(false);
    setPaymentItem(null);
    setIsInvoiceOpen(false);
    setInvoicingItem(null);
  }, []);

  const filteredItems = React.useMemo(() => 
    items.filter(
      (item) =>
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.customerId && item.customerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.itemsDescription.toLowerCase().includes(searchTerm.toLowerCase())
  ), [items, searchTerm]);

  if (isFirebaseConfigInvalid) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error de Configuración de Firebase</AlertTitle>
        <AlertDescription>
          La aplicación no puede conectarse a la base de datos. Por favor, asegúrate de que has introducido
          tus credenciales de Firebase en el archivo <strong>src/lib/firebase.ts</strong>.
        </AlertDescription>
      </Alert>
    );
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
              onAddPayment={handleOpenPaymentDialog}
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
        onClose={handleCloseDialogs}
        onSave={handleSaveItem}
        itemToEdit={editingItem}
        laundryServices={laundryServices}
      />
      <AddPaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={handleCloseDialogs}
        onSave={handleSavePayment}
        item={paymentItem}
      />
      <InvoiceDialog
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        item={invoicingItem}
      />
    </div>
  );
}
