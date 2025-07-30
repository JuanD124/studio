'use client';

import * as React from 'react';
import { db, isFirebaseConfigInvalid } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, writeBatch, query, orderBy, updateDoc, getDoc, runTransaction, deleteDoc } from 'firebase/firestore';
import type { StoredItem, LaundryItem, ClaimedItem, Payment, IncomeEntry, ActivityLogEntry } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PlusCircle, Search, Droplets, Archive } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { InvoiceDialog } from './invoice-dialog';
import { StoredItemCard } from './stored-item-card';
import { AddPaymentDialog } from './add-payment-dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { EditLocationDialog } from './edit-location-dialog';
import { EditPaymentDialog } from './edit-payment-dialog';
import { formatCurrency } from '@/lib/utils';


async function logActivity(user: { username: string }, action: ActivityLogEntry['action'], itemId: string, details: string) {
    if (!db || !user) return;
    try {
      const log: Omit<ActivityLogEntry, 'id'> = {
        date: new Date().toISOString(),
        user: user.username,
        action,
        itemId,
        details,
      };
      await addDoc(collection(db, 'activityLog'), log);
    } catch (error) {
      console.error("Error logging activity:", error);
    }
}


export default function StorageManager() {
  const [items, setItems] = React.useState<StoredItem[]>([]);
  const [laundryServices, setLaundryServices] = React.useState<LaundryItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filter, setFilter] = React.useState<'todos' | 'guardado' | 'lavado'>('todos');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [serviceTypeForDialog, setServiceTypeForDialog] = React.useState<'guardado' | 'lavado'>('guardado');
  const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = React.useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = React.useState(false);
  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = React.useState(false);
  const [paymentToConfirm, setPaymentToConfirm] = React.useState<{item: StoredItem, amount: number, method: Payment['method']} | null>(null);
  
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
          // Backward compatibility for old items
          serviceType: data.serviceType || 'guardado',
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
        
        const updatedData = {
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
        await logActivity(user, 'edited', id, `Artículo de ${itemData.customerName} editado.`);
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
          const newIdString = newId.toString();

          const newItemRef = doc(db, 'storedItems', newIdString);
          
          const newItemData: Omit<StoredItem, 'id'> = {
            ...(itemData as Omit<StoredItem, 'id' | 'storageDate' | 'payments' | 'remainingBalance'>),
            storageDate: new Date().toISOString(),
            payments: [],
            remainingBalance: itemData.totalPrice,
            location: itemData.location || '',
          };

          transaction.set(newItemRef, newItemData);
          transaction.set(counterRef, { lastId: newId }, { merge: true });

          await logActivity(user, 'created', newIdString, `Nuevo artículo para ${itemData.customerName}.`);
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

  const handleOpenConfirmPaymentDialog = (item: StoredItem, amount: number, method: Payment['method']) => {
    setPaymentToConfirm({ item, amount, method });
    setIsPaymentDialogOpen(false);
    setIsConfirmPaymentOpen(true);
  };
  
  const executeSavePayment = React.useCallback(async () => {
    if (!paymentToConfirm || !db || !user) return;
    
    const { item, amount, method } = paymentToConfirm;

    try {
      await runTransaction(db, async (transaction) => {
        const itemRef = doc(db, 'storedItems', item.id);
        const itemDoc = await transaction.get(itemRef);

        if (!itemDoc.exists()) {
          throw new Error("Artículo no encontrado");
        }
        
        const currentItem = itemDoc.data() as StoredItem;
        
        const newPayment: Payment = {
          id: new Date().toISOString() + Math.random().toString(36).substr(2, 9),
          amount,
          date: new Date().toISOString(),
          createdBy: user.username,
          method,
        };
        
        const updatedPayments = [...(currentItem.payments || []), newPayment];
        const newRemainingBalance = currentItem.remainingBalance - amount;

        transaction.update(itemRef, {
          payments: updatedPayments,
          remainingBalance: newRemainingBalance,
        });

        const incomeEntryRef = doc(collection(db, 'incomeEntries'));
        const incomeEntry: IncomeEntry = {
          amount,
          date: new Date().toISOString(),
          itemId: item.id,
          customerName: item.customerName,
          type: 'Abono',
          method,
        };
        transaction.set(incomeEntryRef, incomeEntry);
      });

      await logActivity(user, 'payment_added', item.id, `Abono de ${formatCurrency(amount)} (${method}) para ${item.customerName}.`);
      toast({ title: "Éxito", description: "Abono registrado correctamente." });
    } catch (error) {
      console.error("Error al registrar el abono: ", error);
      toast({ title: "Error", description: "No se pudo registrar el abono.", variant: "destructive" });
    } finally {
        setIsConfirmPaymentOpen(false);
        setPaymentToConfirm(null);
    }
  }, [paymentToConfirm, toast, user]);


  const handleEditPayment = React.useCallback(async (itemId: string, oldPayment: Payment, newAmount: number) => {
    if (!db || !user) return;
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
        updatedPayments[paymentIndex] = { ...updatedPayments[paymentIndex], amount: newAmount, editedBy: { username: user.username, date: new Date().toISOString() }};

        const newTotalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const newRemainingBalance = currentItem.totalPrice - newTotalPaid;

        transaction.update(itemRef, {
          payments: updatedPayments,
          remainingBalance: newRemainingBalance
        });
      });
      await logActivity(user, 'payment_edited', itemId, `Abono editado para ${itemId}.`);
      toast({ title: "Éxito", description: "Abono actualizado correctamente." });
    } catch(error) {
      console.error("Error al editar el abono:", error);
      toast({ title: "Error", description: "No se pudo actualizar el abono.", variant: "destructive" });
    }
  }, [toast, user]);


  const handleClaimItem = React.useCallback((item: StoredItem) => {
    const confirmationMessage = item.remainingBalance > 0
      ? `Este artículo tiene un saldo pendiente de ${formatCurrency(item.remainingBalance)}. Al entregarlo, se registrará el saldo como un ingreso final. ¿Deseas continuar?`
      : `Estás a punto de marcar el artículo de ${item.customerName} como entregado. ¿Estás seguro?`;
    
    if (window.confirm(confirmationMessage)) {
        const claimAction = async () => {
            if (!db || !user) return;
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
    
              await logActivity(user, 'claimed', item.id, `Artículo de ${item.customerName} entregado.`);
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
        claimAction();
    }
  }, [toast, user]);
  
  const handleSaveLocation = React.useCallback(async (itemId: string, location: string) => {
    if (!db || !user) return;
    try {
      const itemRef = doc(db, 'storedItems', itemId);
      await updateDoc(itemRef, { location });
      await logActivity(user, 'location_changed', itemId, `Ubicación cambiada a "${location}" para el artículo ${itemId}.`);
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
  }, [toast, user]);
  
  const handleOpenInvoice = React.useCallback((item: StoredItem) => {
    setInvoicingItem(item);
    setIsInvoiceOpen(true);
  }, []);
  
  const handleOpenAddDialog = React.useCallback((type: 'guardado' | 'lavado') => {
    setEditingItem(null);
    setServiceTypeForDialog(type);
    setIsAddDialogOpen(true);
  }, []);

  const handleOpenEditDialog = React.useCallback((item: StoredItem) => {
    setEditingItem(item);
    setServiceTypeForDialog(item.serviceType);
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
    setIsConfirmPaymentOpen(false);
    setPaymentToConfirm(null);
  }, []);

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const searchMatch =
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.customerId && item.customerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.itemsDescription.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;
      
      const itemServiceType = item.serviceType || 'guardado';

      if (filter === 'todos') {
        return true;
      }
      return itemServiceType === filter;
    });
  }, [items, searchTerm, filter]);

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
            <h1 className="text-3xl font-bold font-headline">Panel de Facturación</h1>
            <p className="text-muted-foreground">Visualiza y gestiona todos los servicios y artículos.</p>
        </div>

        <div className="flex flex-col gap-4">
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
                <div className="flex gap-2">
                    <Button onClick={() => handleOpenAddDialog('lavado')} className="flex-1 flex items-center gap-2">
                        <Droplets className="h-5 w-5" />
                        <span>Nuevo Lavado</span>
                    </Button>
                    <Button onClick={() => handleOpenAddDialog('guardado')} className="flex-1 flex items-center gap-2">
                        <Archive className="h-5 w-5" />
                        <span>Nuevo Guardado</span>
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filtrar:</span>
                <Button variant={filter === 'todos' ? 'secondary' : 'outline'} size="sm" onClick={() => setFilter('todos')}>Todos</Button>
                <Button variant={filter === 'guardado' ? 'secondary' : 'outline'} size="sm" onClick={() => setFilter('guardado')}>Guardado</Button>
                <Button variant={filter === 'lavado' ? 'secondary' : 'outline'} size="sm" onClick={() => setFilter('lavado')}>Lavado</Button>
            </div>
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
            <p className="text-muted-foreground">No se encontraron artículos.</p>
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
        serviceType={serviceTypeForDialog}
      />
      <AddPaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={handleCloseDialogs}
        onSave={handleOpenConfirmPaymentDialog}
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
      <AlertDialog open={isConfirmPaymentOpen} onOpenChange={setIsConfirmPaymentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Abono</AlertDialogTitle>
            <AlertDialogDescription>
                ¿Estás seguro de que quieres registrar un abono de <strong>{formatCurrency(paymentToConfirm?.amount ?? 0)}</strong> para el artículo de <strong>{paymentToConfirm?.item.customerName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmPaymentOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeSavePayment}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
