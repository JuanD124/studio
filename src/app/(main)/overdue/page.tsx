
'use client'

import React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { StoredItem } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, ShieldAlert, Search, DollarSign } from 'lucide-react';
import { differenceInMonths } from 'date-fns';
import { OverdueList } from '@/components/overdue/overdue-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';


type FilterType = 'all' | 'overdue';

export default function OverduePage() {
  const { user } = useAuth();
  const [allItems, setAllItems] = React.useState<StoredItem[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<StoredItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<FilterType>('all');

  React.useEffect(() => {
    if (!db) return;
    
    const q = query(collection(db, 'storedItems'), orderBy('storageDate', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: StoredItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as StoredItem);
      });
      setAllItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    let newFilteredItems = allItems;

    if (activeFilter === 'overdue') {
      newFilteredItems = newFilteredItems.filter(item => 
        differenceInMonths(new Date(), new Date(item.storageDate)) >= 6
      );
    }
    
    if (searchTerm) {
      newFilteredItems = newFilteredItems.filter(item =>
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.customerId && item.customerId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredItems(newFilteredItems);

  }, [allItems, searchTerm, activeFilter]);

  const totalInventoryValue = React.useMemo(() => {
    return allItems.reduce((total, item) => total + item.totalPrice, 0);
  }, [allItems]);


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
        <h1 className="text-3xl font-bold font-headline">Control de Artículos Almacenados</h1>
        <p className="text-muted-foreground">
          Revisa todos los artículos, con filtros para controlar los más antiguos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Artículos Almacenados</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{allItems.length}</div>
                <p className="text-xs text-muted-foreground">Cantidad actual en inventario.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total del Inventario</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</div>
                <p className="text-xs text-muted-foreground">Suma del precio total de cada artículo, sin descontar abonos.</p>
            </CardContent>
        </Card>
      </div>


      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 p-4 border rounded-lg bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, nombre o cédula..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='flex items-center gap-2'>
            <Button 
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('all')}
            >
                Todos
            </Button>
            <Button 
                variant={activeFilter === 'overdue' ? 'destructive' : 'outline'}
                onClick={() => setActiveFilter('overdue')}
            >
                Más de 6 meses
            </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <OverdueList items={filteredItems} />
      )}
    </div>
  );
}
