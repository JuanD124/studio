'use client';

import React from 'react';
import type { StoredItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Archive, CalendarClock } from 'lucide-react';
import { cn, getStorageDuration } from '@/lib/utils';
import { differenceInMonths } from 'date-fns';

interface DashboardSummaryProps {
  items: StoredItem[];
}

export function DashboardSummary({ items }: DashboardSummaryProps) {
  if (items.length === 0) {
    return null;
  }

  // Find the oldest item
  const oldestItem = items.reduce((oldest, current) => {
    const oldestDate = new Date(oldest.storageDate);
    const currentDate = new Date(current.storageDate);
    return currentDate < oldestDate ? current : oldest;
  }, items[0]);

  const monthsInStorage = differenceInMonths(new Date(), new Date(oldestItem.storageDate));
  const isOverdue = monthsInStorage >= 6;

  return (
    <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Resumen del Almacén</h1>
        <p className="text-muted-foreground">Vista rápida de las métricas más importantes.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
            <Card className={cn(isOverdue && 'bg-destructive/10 border-destructive')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Artículo Más Antiguo</CardTitle>
                    <CalendarClock className={cn("h-4 w-4 text-muted-foreground", isOverdue && "text-destructive")} />
                </CardHeader>
                <CardContent>
                    {oldestItem ? (
                        <>
                            <div className="text-2xl font-bold">{oldestItem.customerName}</div>
                            <p className="text-xs text-muted-foreground">
                                ID: {oldestItem.id} - Almacenado por {getStorageDuration(oldestItem.storageDate)}
                            </p>
                            {isOverdue && (
                                <div className="mt-2 flex items-center text-destructive text-sm font-semibold">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    <span>¡Lleva más de 6 meses guardado!</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">No hay artículos.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Artículos</CardTitle>
                    <Archive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{items.length}</div>
                    <p className="text-xs text-muted-foreground">
                        Artículos actualmente en el almacén.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
