'use client';
import React from 'react';
import type { ClaimedItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { CalendarDays, Clock, Package, RotateCcw, Trash2, User, Fingerprint, MoreVertical, Pencil } from 'lucide-react';
import { formatCurrency, getStorageDuration } from '@/lib/utils';
import { format } from 'date-fns';

interface ClaimedItemCardProps {
  item: ClaimedItem;
  onRestore: (item: ClaimedItem) => void;
  onDelete: (id: string) => void;
}

function ClaimedItemCardComponent({ item, onRestore, onDelete }: ClaimedItemCardProps) {
  const totalPaid = item.totalPrice;
  
  return (
    <Card className="flex flex-col transition-all hover:shadow-md bg-muted/30">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
            <div className='flex-1'>
                <CardTitle className="font-headline text-lg">
                {item.customerName}
                </CardTitle>
                <Badge variant="outline" className="mt-1">ID: {item.id}</Badge>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreVertical className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRestore(item)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        <span>Restaurar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <CardDescription className="flex items-center gap-2 pt-2 text-sm">
          <Package className="w-4 h-4" />
          <span>{item.itemsDescription}</span>
        </CardDescription>
        <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <div className="flex items-center gap-2">
                <User className="w-3 h-3"/>
                <span>{item.rank}</span>
            </div>
            {item.customerId && <div className="flex items-center gap-2"><Fingerprint className="w-3 h-3"/><span>C.C. {item.customerId}</span></div>}
        </div>
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
      </CardContent>
      <CardFooter>
        <div className="w-full text-right font-semibold pt-2 border-t">
            Total Pagado: {formatCurrency(totalPaid)}
        </div>
      </CardFooter>
    </Card>
  );
}

export const ClaimedItemCard = React.memo(ClaimedItemCardComponent);
