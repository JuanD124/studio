'use client';

import * as React from 'react';
import { initialStoredItems, initialLaundryItems } from '@/lib/data';
import type { StoredItem, LaundryItem, ClaimedItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, CalendarDays, Clock, Package, PackageCheck, FileText } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { InvoiceDialog } from './invoice-dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function StorageManager() {
  const [items, setItems] = useLocalStorage<StoredItem[]>('storedItems', initialStoredItems);
  const [laundryServices] = useLocalStorage<LaundryItem[]>('laundryItems', initialLaundryItems);
  const [claimedItems, setClaimedItems] = useLocalStorage<ClaimedItem[]>('claimedItems', []);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = React.useState(false);
  const [invoicingItem, setInvoicingItem] = React.useState<StoredItem | null>(null);

  const filteredItems = items.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm) ||
      item.itemsDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.battalion?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const itemToClaim = items.find((item) => item.id === id);
    if (itemToClaim) {
      const claimedItem: ClaimedItem = {
        ...itemToClaim,
        claimedDate: new Date().toISOString(),
      };
      setClaimedItems((prevClaimed) => [...prevClaimed, claimedItem]);
      setItems(items.filter((item) => item.id !== id));
    }
  };
  
  const handleOpenInvoice = (item: StoredItem) => {
    setInvoicingItem(item);
    setIsInvoiceOpen(true);
  };

  const getStorageDuration = (date: string) => {
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch (e) {
        return "Fecha inválida";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }


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
            <Card key={item.id} className="flex flex-col transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline flex items-center justify-between">
                  <span>{item.customerName}</span>
                   <Badge variant="secondary">ID: {item.id}</Badge>
                </CardTitle>
                <CardDescription className="flex flex-col gap-1 pt-2">
                    {(item.rank || item.battalion) && (
                        <div className="text-xs text-muted-foreground">
                            {item.rank && <span>{item.rank}</span>}
                            {item.rank && item.battalion && <span> &bull; </span>}
                            {item.battalion && <span>{item.battalion}</span>}
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>{item.itemsDescription}</span>
                        {item.ticketColor && <Badge variant="outline">{item.ticketColor}</Badge>}
                    </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <span>Almacenado el: {new Date(item.storageDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Duración: {getStorageDuration(item.storageDate)}</span>
                    </div>
                </div>
                <div className="space-y-2 text-sm">
                    <Separator />
                    <div className="flex justify-between pt-2">
                        <span className="text-muted-foreground">Almacenamiento:</span>
                        <span className="font-medium">{formatCurrency(item.storagePrice)}</span>
                    </div>
                    {item.laundryItems && item.laundryItems.length > 0 && (
                        <div className="pt-1">
                            <span className="text-muted-foreground">Lavandería:</span>
                            <ul className="pl-4 mt-1 space-y-1">
                                {item.laundryItems.map(subItem => (
                                    <li key={subItem.laundryItemId} className="flex justify-between text-muted-foreground">
                                        <span>{subItem.quantity}x {subItem.name}</span>
                                        <span className="font-medium text-right">{formatCurrency(subItem.price * subItem.quantity)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="flex justify-between font-semibold text-base pt-2 border-t mt-2">
                        <span>Total a Pagar:</span>
                        <span>{formatCurrency(item.totalPrice)}</span>
                    </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="w-full" onClick={() => handleClaimItem(item.id)}>
                      <PackageCheck className="mr-2 h-4 w-4" />
                      Marcar como Recogido
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => handleOpenInvoice(item)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Generar Factura
                    </Button>
                </div>
              </CardFooter>
            </Card>
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
