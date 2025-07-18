
'use client'

import React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { StoredItem } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { differenceInMonths } from 'date-fns';
import { OverdueList } from '@/components/overdue/overdue-list';
import { Skeleton } from '@/components/ui/skeleton';

export default function OverduePage() {
  const { user } = useAuth();
  const [overdueItems, setOverdueItems] = React.useState<StoredItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!db) return;
    
    const q = query(collection(db, 'storedItems'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allItems: StoredItem[] = [];
      querySnapshot.forEach((doc) => {
        allItems.push({ id: doc.id, ...doc.data() } as StoredItem);
      });

      const filteredItems = allItems.filter(item => 
        differenceInMonths(new Date(), new Date(item.storageDate)) >= 6
      );
      
      filteredItems.sort((a, b) => new Date(a.storageDate).getTime() - new Date(b.storageDate).getTime());
      
      setOverdueItems(filteredItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (user?.role !== 'gerente') {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Acceso Denegado</AlertTitle>
        <AlertDescription>
          No tienes permiso para ver esta página. Por favor, contacta a un administrador.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Artículos Vencidos</h1>
        <p className="text-muted-foreground">
          Lista de artículos almacenados por 6 meses o más.
        </p>
      </div>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <OverdueList items={overdueItems} />
      )}
    </div>
  );
}
