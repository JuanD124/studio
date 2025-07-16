'use client';

import type { StoredItem } from '@/lib/types';
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
import { CalendarDays, Clock, FileText, Package, PackageCheck, Palette, Shield, User, Users, Fingerprint, MoreVertical, Pencil, HandCoins, Receipt } from 'lucide-react';
import { formatCurrency, getStorageDuration } from '@/lib/utils';
import { format } from 'date-fns';

interface StoredItemCardProps {
  item: StoredItem;
  onClaim: (item: StoredItem) => void;
  onOpenInvoice: (item: StoredItem) => void;
  onEdit: (item: StoredItem) => void;
  onAddPayment: (item: StoredItem) => void;
}

export function StoredItemCard({ item, onClaim, onOpenInvoice, onEdit, onAddPayment }: StoredItemCardProps) {
  const totalPaid = item.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  
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
                    <span>Editar</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Badge variant="secondary" className="w-fit">ID: {item.id.substring(0,6)}</Badge>
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
        </div>
        <div className="space-y-2 text-sm">
          <Separator />
           <div className="flex justify-between font-semibold text-base pt-2">
            <span>Total:</span>
            <span>{formatCurrency(item.totalPrice)}</span>
          </div>
          {item.payments && item.payments.length > 0 && (
            <div className="pt-1">
              <span className="text-muted-foreground">Abonos:</span>
              <ul className="pl-4 mt-1 space-y-1">
                {item.payments.map((payment, index) => (
                  <li key={index} className="flex justify-between text-muted-foreground text-xs">
                    <span>{format(new Date(payment.date), 'dd/MM/yy')}:</span>
                    <span className="font-medium text-right">{formatCurrency(payment.amount)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-medium text-sm pt-1 border-t mt-1">
                <span>Total Abonado:</span>
                <span>{formatCurrency(totalPaid)}</span>
             </div>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2 text-primary">
            <span>Saldo Pendiente:</span>
            <span>{formatCurrency(item.remainingBalance)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap">
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" className="w-full" onClick={() => onAddPayment(item)} disabled={item.remainingBalance <= 0}>
            <HandCoins className="mr-2 h-4 w-4" />
            Abonar
          </Button>
          <Button variant="outline" className="w-full" onClick={() => onClaim(item)} disabled={item.remainingBalance > 0}>
            <PackageCheck className="mr-2 h-4 w-4" />
            Entregado
          </Button>
          <Button className="w-full" onClick={() => onOpenInvoice(item)}>
            <Receipt className="mr-2 h-4 w-4" />
            Factura
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
