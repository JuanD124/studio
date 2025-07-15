'use client';

import type { StoredItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Package, RotateCcw, Trash2 } from 'lucide-react';
import { formatCurrency, getStorageDuration } from '@/lib/utils';
import { format } from 'date-fns';

interface ClaimedItemCardProps {
  item: StoredItem & { claimedDate: string };
  onRestore: (item: StoredItem) => void;
  onDelete: (id: string) => void;
}

export function ClaimedItemCard({ item, onRestore, onDelete }: ClaimedItemCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:shadow-md bg-muted/30">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-lg flex items-center justify-between">
          <span>{item.customerName}</span>
          <Badge variant="outline">ID: {item.id.substring(0,6)}</Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1 text-sm">
          <Package className="w-4 h-4" />
          <span>{item.itemsDescription}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
         <div className="space-y-1">
          <div className="flex items-center text-muted-foreground">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Almacenado: {format(new Date(item.storageDate), 'dd/MM/yyyy')}</span>
          </div>
           <div className="flex items-center text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>Duración: {getStorageDuration(item.storageDate, item.claimedDate)}</span>
          </div>
          <div className="flex items-center font-medium text-destructive/80">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Entregado: {format(new Date(item.claimedDate), 'dd/MM/yyyy')}</span>
          </div>
        </div>
        <div className="text-right font-semibold pt-2 border-t">
            Total Pagado: {formatCurrency(item.totalPrice)}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex gap-2">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => onRestore(item)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar
          </Button>
          <Button variant="destructive" size="sm" className="w-full" onClick={() => onDelete(item.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
