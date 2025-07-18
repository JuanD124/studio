'use client';
import React from 'react';
import type { Payment, StoredItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Clock, Package, PackageCheck, Palette, Shield, User, Users, Fingerprint, MoreVertical, Pencil, Receipt, Banknote, History, Shirt } from 'lucide-react';
import { formatCurrency, getStorageDuration } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface StoredItemCardProps {
  item: StoredItem;
  onClaim: (item: StoredItem) => void;
  onOpenInvoice: (item: StoredItem) => void;
  onEdit: (item: StoredItem) => void;
  onAddPayment: (item: StoredItem) => void;
}

const PaymentHistory = ({ payments }: { payments: Payment[] }) => (
    <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2 font-medium">
            <History className="w-3.5 h-3.5" />
            <span>Historial de Abonos</span>
        </div>
        {payments.map((p, index) => (
            <div key={index} className="flex justify-between items-center pl-4">
                <span>{format(new Date(p.date), 'dd/MM/yyyy')}</span>
                <Badge variant="outline">{formatCurrency(p.amount)}</Badge>
            </div>
        ))}
    </div>
);

const LaundryItemsList = ({ items }: { items: StoredItem['laundryItems'] }) => (
  <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2 font-medium">
          <Shirt className="w-3.5 h-3.5" />
          <span>Servicios de Lavandería</span>
      </div>
      {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center pl-4">
              <span>{item.quantity} &times; {item.name}</span>
              <Badge variant="outline">{formatCurrency(item.price * item.quantity)}</Badge>
          </div>
      ))}
  </div>
);


function StoredItemCardComponent({ item, onClaim, onOpenInvoice, onEdit, onAddPayment }: StoredItemCardProps) {
  
  const payments = item.payments || [];
  const laundryItems = item.laundryItems || [];

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="font-headline flex-1">
                {item.customerName}
            </CardTitle>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreVertical className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Editar Artículo</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Badge variant="secondary" className="w-fit">ID: {item.id}</Badge>
        <CardDescription className="flex items-center gap-2 pt-2">
          <Package className="w-4 h-4" />
          <span>{item.itemsDescription}</span>
        </CardDescription>
         <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <div className="flex items-center gap-2">
                <User className="w-3 h-3"/>
                <span>{item.rank}</span>
            </div>
            {item.customerId && <div className="flex items-center gap-2"><Fingerprint className="w-3 h-3"/><span>C.C. {item.customerId}</span></div>}
            {item.battalion && <div className="flex items-center gap-2"><Shield className="w-3 h-3"/><span>{item.battalion}</span></div>}
            {item.contingent && <div className="flex items-center gap-2"><Users className="w-3 h-3"/><span>{item.contingent}</span></div>}
            {item.color && <div className="flex items-center gap-2"><Palette className="w-3 h-3"/><span>{item.color}</span></div>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Almacenado: {new Date(item.storageDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>Duración: {getStorageDuration(item.storageDate)}</span>
          </div>
          {item.editedBy && (
            <div className="flex items-center text-xs text-amber-600 italic">
              <History className="mr-2 h-3 w-3" />
              <span>
                Editado por {item.editedBy.username} el {format(new Date(item.editedBy.date), 'dd/MM/yy HH:mm')}
              </span>
            </div>
          )}
        </div>
        
        {laundryItems.length > 0 && <LaundryItemsList items={laundryItems} />}
        {payments.length > 0 && <PaymentHistory payments={payments} />}

        <div className="space-y-2 text-sm pt-2">
          <Separator />
           <div className="flex justify-between font-semibold text-base pt-2">
            <span>Total a Pagar:</span>
            <span>{formatCurrency(item.totalPrice)}</span>
          </div>
          <div className="flex justify-between text-destructive">
            <span>Saldo Pendiente:</span>
            <span className="font-bold">{formatCurrency(item.remainingBalance)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => onAddPayment(item)} disabled={item.remainingBalance <= 0}>
            <Banknote className="mr-2 h-4 w-4" />
            Abonar
          </Button>
          <Button variant="secondary" className="flex-1 min-w-[120px]" onClick={() => onClaim(item)}>
            <PackageCheck className="mr-2 h-4 w-4" />
            Entregado
          </Button>
          <Button className="flex-grow w-full" onClick={() => onOpenInvoice(item)}>
            <Receipt className="mr-2 h-4 w-4" />
            Factura
          </Button>
      </CardFooter>
    </Card>
  );
}

export const StoredItemCard = React.memo(StoredItemCardComponent);