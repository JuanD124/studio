
'use client';

import React from 'react';
import type { StoredItem } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { getStorageDuration } from '@/lib/utils';
import { format, differenceInMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Badge } from 'lucide-react';

interface OverdueListProps {
  items: StoredItem[];
}

export function OverdueList({ items }: OverdueListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No se encontraron artículos.</p>
        <p className="text-sm text-muted-foreground">
          Intenta ajustar los filtros o la búsqueda.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Fecha de Ingreso</TableHead>
              <TableHead className="text-right">Tiempo Almacenado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
                const isOverdue = differenceInMonths(new Date(), new Date(item.storageDate)) >= 6;
                return (
                    <TableRow key={item.id} className={isOverdue ? 'bg-destructive/10 hover:bg-destructive/20' : ''}>
                        <TableCell className="font-mono">{item.id}</TableCell>
                        <TableCell className="font-medium">{item.customerName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.itemsDescription}</TableCell>
                        <TableCell>
                        {format(new Date(item.storageDate), 'dd MMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            <div className='flex items-center justify-end gap-2'>
                                {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                {getStorageDuration(item.storageDate)}
                            </div>
                        </TableCell>
                    </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
