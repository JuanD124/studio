'use client';

import * as React from 'react';
import { db, isFirebaseConfigInvalid } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, writeBatch, query, orderBy, updateDoc, arrayUnion, runTransaction, getDoc, setDoc } from 'firebase/firestore';
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
import { useAuth } from '@/context/AuthContext';
import { EditLocationDialog } from './edit-location-dialog';
import { EditPaymentDialog } from './edit-payment-dialog';
import { ConfirmationDialog } from './confirmation-dialog';

export default function StorageManager() {
  const [items, setItems] = React.useState<StoredItem[]>([]);
  const [laundryServices, setLaundryServices] = React.useState<LaundryItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = React.useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = React.useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);
  const [confirmationData, setConfirmationData] = React.useState<{ title: string; description: string; onConfirm: () => void; } | null>(null);
  
  const [invoicingItem, setInvoicingItem] = React.useState<StoredItem | null>(null);
  const [editingItem, setEditingItem] = React.useState<StoredItem | null>(null);
  const [paymentItem, setPaymentItem] = React.useState<StoredItem | null>(null);
  const [editingPaymentInfo, setEditingPaymentInfo] = React.useState<{ item: StoredItem; payment: Payment } | null>(null);
  const [locationItem, setLocationItem] = React.useState<StoredItem | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  React.useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'storedItems'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsData: StoredItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        itemsData.push({ 
          id: doc.id,
          ...data,
          storageDate: data.storageDate,
        } as StoredItem);
      });
      itemsData.sort((a, b) => Number(b.id) - Number(a.id));
      setItems(itemsData);
    }, (error) => {
        console.error("Error fetching stored items:", error);
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
    }, (error) => {
        console.error("Error fetching laundry services:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveItem = React.useCallback(async (itemData: Omit<StoredItem, 'id' | 'storageDate' | 'payments' | 'remainingBalance' | 'editedBy' >, id?: string) => {
    if (!db || !user) return;
    try {
      if (id) {
        const itemRef = doc(db, 'storedItems', id);
        const itemDoc = await getDoc(itemRef);
        if (!itemDoc.exists()) throw new Error("Item no encontrado");

        const existingItem = itemDoc.data() as StoredItem;
        const totalPaid = existingItem.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        
        const updatedData: Omit<StoredItem, 'id' | 'storageDate'> = {
          ...itemData,
          customerPhone: itemData.customerPhone || '',
          location: itemData.location || existingItem.location || '',
          payments: existingItem.payments || [],
          remainingBalance: itemData.totalPrice - totalPaid,
          editedBy: {
            username: user.username,
            date: new Date().toISOString(),
          }
        };
        await updateDoc(itemRef, updatedData);
        toast({
          title: "Éxito",
          description: "El artículo ha sido actualizado correctamente.",
        });
      } else {
        await runTransaction(db, async (transaction) => {
          const counterRef = doc(db, 'counters', 'storedItems');
          const counterDoc = await transaction.get(counterRef);

          let newId = 1;
          if (counterDoc.exists()) {
            newId = counterDoc.data().lastId + 1;
          }

          const newItemRef = doc(db, 'storedItems', newId.toString());
          
          const newItemData: Omit<StoredItem, 'id'> = {
            ...(itemData as Omit<StoredItem, 'id' | 'storageDate' | 'payments' | 'remainingBalance'>),
            storageDate: new Date().toISOString(),
            payments: [],
            remainingBalance: itemData.totalPrice,
            location: itemData.location || '',
          };

          transaction.set(newItemRef, newItemData);
          transaction.set(counterRef, { lastId: newId }, { merge: true });
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
  }, [toast, user]);

  const handleSavePayment = React.useCallback((item: StoredItem, amount: number, method: Payment['method']) => {
    setConfirmationData({
      title: '¿Confirmar Abono?',
      description: `Estás a punto de registrar un abono de ${formatCurrency(amount)} por ${method}. ¿Deseas continuar?`,
      onConfirm: async () => {
        if (!db || !user) return;

        const itemRef = doc(db, 'storedItems', item.id);
        const incomeEntryRef = doc(collection(db, 'incomeEntries'));

        try {
            const batch = writeBatch(db);

            const newPayment: Payment = {
                id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
                amount,
                date: new Date().toISOString(),
                createdBy: user.username,
                method,
            };

            const newRemainingBalance = item.remainingBalance - amount;

            batch.update(itemRef, {
                payments: arrayUnion(newPayment),
                remainingBalance: newRemainingBalance,
            });

            const incomeEntry: IncomeEntry = {
                amount,
                date: new Date().toISOString(),
                itemId: item.id,
                customerName: item.customerName,
                type: 'Abono',
                method,
            };
            batch.set(incomeEntryRef, incomeEntry);

            await batch.commit();
            toast({ title: "Éxito", description: "Abono registrado correctamente." });
        } catch (error) {
            console.error("Error al registrar el abono: ", error);
            toast({ title: "Error", description: "No se pudo registrar el abono.", variant: "destructive" });
        }
      }
    });
    setIsConfirmationOpen(true);
  }, [toast, user]);

  const handleEditPayment = React.useCallback(async (itemId: string, oldPayment: Payment, newAmount: number) => {
    if (!db) return;
    try {
      await runTransaction(db, async (transaction) => {
        const itemRef = doc(db, 'storedItems', itemId);
        const itemDoc = await transaction.get(itemRef);

        if (!itemDoc.exists()) {
          throw new Error("Artículo no encontrado");
        }
        
        const currentItem = itemDoc.data() as StoredItem;
        const payments = currentItem.payments || [];
        
        const paymentIndex = payments.findIndex(p => p.id === oldPayment.id);
        if (paymentIndex === -1) {
          throw new Error("Abono no encontrado para editar");
        }

        const updatedPayments = [...payments];
        const originalAmount = updatedPayments[paymentIndex].amount;
        updatedPayments[paymentIndex] = { ...updatedPayments[paymentIndex], amount: newAmount };

        // For simplicity, we assume income entries are not updated. 
        // A more robust solution would find and update the corresponding income entry.

        const newTotalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const newRemainingBalance = currentItem.totalPrice - newTotalPaid;

        transaction.update(itemRef, {
          payments: updatedPayments,
          remainingBalance: newRemainingBalance
        });
      });
      toast({ title: "Éxito", description: "Abono actualizado correctamente." });
    } catch(error) {
      console.error("Error al editar el abono:", error);
      toast({ title: "Error", description: "No se pudo actualizar el abono.", variant: "destructive" });
    }
  }, [toast]);


  const handleClaimItem = React.useCallback((item: StoredItem) => {
    const description = item.remainingBalance > 0
      ? `Este artículo tiene un saldo pendiente de ${formatCurrency(item.remainingBalance)}. Al entregarlo, se registrará el saldo como un ingreso final. ¿Deseas continuar?`
      : `Estás a punto de marcar el artículo de ${item.customerName} como entregado. ¿Estás seguro?`;
    
    setConfirmationData({
      title: 'Confirmar Entrega de Artículo',
      description,
      onConfirm: async () => {
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
          
          if (item.remainingBalance > 0) {
            const finalPaymentEntryRef = doc(collection(db, 'incomeEntries'));
            const finalIncomeEntry: IncomeEntry = {
                amount: item.remainingBalance,
                date: new Date().toISOString(),
                itemId: item.id,
                customerName: item.customerName,
                type: 'Entrega',
                method: 'Efectivo', // Default method for final settlement
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
      }
    });
    setIsConfirmationOpen(true);
  }, [toast]);
  
  const handleSaveLocation = React.useCallback(async (itemId: string, location: string) => {
    if (!db) return;
    try {
      const itemRef = doc(db, 'storedItems', itemId);
      await updateDoc(itemRef, { location });
      toast({
        title: 'Ubicación Guardada',
        description: 'La ubicación del artículo se ha actualizado.',
      });
    } catch (error) {
      console.error("Error al guardar la ubicación: ", error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la ubicación.',
        variant: 'destructive',
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

  const handleOpenEditPaymentDialog = React.useCallback((item: StoredItem, payment: Payment) => {
    setEditingPaymentInfo({ item, payment });
    setIsEditPaymentDialogOpen(true);
  }, []);
  
  const handleOpenLocationDialog = React.useCallback((item: StoredItem) => {
    setLocationItem(item);
    setIsLocationDialogOpen(true);
  }, []);


  const handleCloseDialogs = React.useCallback(() => {
    setIsAddDialogOpen(false);
    setEditingItem(null);
    setIsPaymentDialogOpen(false);
    setPaymentItem(null);
    setIsInvoiceOpen(false);
    setInvoicingItem(null);
    setIsLocationDialogOpen(false);
    setLocationItem(null);
    setIsEditPaymentDialogOpen(false);
    setEditingPaymentInfo(null);
    setIsConfirmationOpen(false);
    setConfirmationData(null);
  }, []);

  const filteredItems = React.useMemo(() => 
    items.filter(
      (item) =>
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div>
        <div className="mb-6">
            <h1 className="text-3xl font-bold font-headline">Panel de Almacenamiento</h1>
            <p className="text-muted-foreground">Visualiza y gestiona todos los artículos almacenados.</p>
        </div>
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {filteredItems.map((item) => (
                <StoredItemCard 
                    key={item.id}
                    item={item}
                    onClaim={handleClaimItem}
                    onOpenInvoice={handleOpenInvoice}
                    onEdit={handleOpenEditDialog}
                    onAddPayment={handleOpenPaymentDialog}
                    onEditPayment={handleOpenEditPaymentDialog}
                    onEditLocation={handleOpenLocationDialog}
                />
            ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
            <p className="text-muted-foreground">No se encontraron artículos almacenados.</p>
            <p className="text-sm text-muted-foreground">Intenta ajustar tu búsqueda o añade un nuevo artículo.</p>
            </div>
        )}
      </div>


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
      <EditPaymentDialog
        isOpen={isEditPaymentDialogOpen}
        onClose={handleCloseDialogs}
        onSave={handleEditPayment}
        paymentInfo={editingPaymentInfo}
      />
      <InvoiceDialog
        isOpen={isInvoiceOpen}
        onClose={handleCloseDialogs}
        item={invoicingItem}
      />
       <EditLocationDialog
        isOpen={isLocationDialogOpen}
        onClose={handleCloseDialogs}
        onSave={handleSaveLocation}
        item={locationItem}
      />
       {confirmationData && (
        <ConfirmationDialog
          isOpen={isConfirmationOpen}
          onClose={handleCloseDialogs}
          title={confirmationData.title}
          description={confirmationData.description}
          onConfirm={confirmationData.onConfirm}
        />
      )}
    </div>
  );
}
