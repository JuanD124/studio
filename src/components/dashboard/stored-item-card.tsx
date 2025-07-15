'use client';

import type { StoredItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Clock, FileText, Package, PackageCheck, Palette, Shield, User, Users } from 'lucide-react';
import { formatCurrency, getStorageDuration } from '@/lib/utils';

interface StoredItemCardProps {
  item: StoredItem;
  onClaim: (item: StoredItem) => void;
  onOpenInvoice: (item: StoredItem) => void;
}

export function StoredItemCard({ item, onClaim, onOpenInvoice }: StoredItemCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center justify-between">
          <span>{item.customerName}</span>
          <Badge variant="secondary">ID: {item.id.substring(0,6)}</Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-2">
          <Package className="w-4 h-4" />
          <span>{item.itemsDescription}</span>
        </CardDescription>
         <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <div className="flex items-center gap-2">
                <User className="w-3 h-3"/>
                <span>{item.rank}</span>
            </div>
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
          <Button variant="outline" className="w-full" onClick={() => onClaim(item)}>
            <PackageCheck className="mr-2 h-4 w-4" />
            Marcar como Entregado
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => onOpenInvoice(item)}>
            <FileText className="mr-2 h-4 w-4" />
            Generar Factura
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
