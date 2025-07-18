
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OverdueListProps {
  items: StoredItem[];
}

export function OverdueList({ items }: OverdueListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No hay artículos vencidos.</p>
        <p className="text-sm text-muted-foreground">
          ¡Buen trabajo! No hay artículos con más de 6 meses de almacenamiento.
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
              <TableHead>Fecha de Ingreso</TableHead>
              <TableHead className="text-right">Tiempo Almacenado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="bg-destructive/10 hover:bg-destructive/20">
                <TableCell className="font-mono">{item.id}</TableCell>
                <TableCell className="font-medium">{item.customerName}</TableCell>
                <TableCell>
                  {format(new Date(item.storageDate), 'dd MMM yyyy', { locale: es })}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {getStorageDuration(item.storageDate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
