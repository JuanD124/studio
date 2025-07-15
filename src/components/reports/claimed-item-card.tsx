'use client';

import type { ClaimedItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarCheck, Package, RotateCcw, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface ClaimedItemCardProps {
  item: ClaimedItem;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ClaimedItemCard({ item, onRestore, onDelete }: ClaimedItemCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:shadow-lg bg-muted/20">
      <CardHeader>
        <CardTitle className="font-headline flex items-center justify-between">
          <span>{item.customerName}</span>
          <Badge variant="secondary">Ticket No. {item.ticketNumber}</Badge>
        </CardTitle>
        <CardDescription className="flex flex-col gap-1 pt-2">
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2">
                {item.rank && <span>{item.rank}</span>}
                {item.battalion && (
                <>
                    {item.rank && <span> &bull; </span>}
                    <span>{item.battalion}</span>
                </>
                )}
                 {item.contingent && (
                <>
                    {(item.rank || item.battalion) && <span> &bull; </span>}
                    <span>Cont. {item.contingent}</span>
                </>
                )}
            </div>
            <div className="flex items-center gap-2 pt-1">
                <Package className="w-4 h-4" />
                <span>{item.itemsDescription}</span>
                 {item.ticketColor && <Badge variant="outline">{item.ticketColor}</Badge>}
            </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarCheck className="mr-2 h-4 w-4" />
            <span>Entregado el: {new Date(item.claimedDate).toLocaleDateString()}</span>
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
            <span>Total Pagado:</span>
            <span>{formatCurrency(item.totalPrice)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col sm:flex-row gap-2">
           <Button variant="outline" className="w-full" onClick={() => onRestore(item.id)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción es permanente y no se puede deshacer. El registro del artículo se eliminará por completo.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(item.id)}>
                    Sí, eliminar
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
