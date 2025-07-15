'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, addDoc, runTransaction, getDoc } from 'firebase/firestore';
import type { ClaimedItem, StoredItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, PackageCheck, Calendar, TrendingUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { isToday, isThisMonth, isThisYear, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { ClaimedItemCard } from './claimed-item-card';


export default function ReportsView() {
  const [claimedItems, setClaimedItems] = React.useState<ClaimedItem[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, 'claimedItems'), orderBy('claimedDate', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const itemsData: ClaimedItem[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            itemsData.push({
                id: doc.id,
                ...data,
            } as ClaimedItem);
        });
        setClaimedItems(itemsData);
    });
    return () => unsubscribe();
  }, []);
  
  const handleRestoreItem = async (id: string) => {
    const claimedItemRef = doc(db, 'claimedItems', id);
    try {
        const claimedItemSnap = await getDoc(claimedItemRef);
        if (claimedItemSnap.exists()) {
            const itemToRestoreData = claimedItemSnap.data();
            // Create a payload for the new stored item, omitting fields we don't want to carry over.
            const { id: claimedId, claimedDate, ...restoredItemPayload } = itemToRestoreData;
            
            // Add the restored item back to the 'storedItems' collection.
            // It will get a new document ID from Firestore automatically.
            await addDoc(collection(db, 'storedItems'), restoredItemPayload);

            // Delete the item from the 'claimedItems' collection.
            await deleteDoc(claimedItemRef);
        } else {
            console.error("No such document to restore!");
        }
    } catch (error) {
        console.error("Error restoring item: ", error);
    }
  };
  
  const handleDeleteItem = async (id: string) => {
      const itemRef = doc(db, 'claimedItems', id);
      try {
          await deleteDoc(itemRef);
      } catch (error) {
          console.error("Error deleting item permanently: ", error);
      }
  };


  const reportData = React.useMemo(() => {
    const incomeToday = claimedItems
      .filter((item) => isToday(parseISO(item.claimedDate)))
      .reduce((sum, item) => sum + item.totalPrice, 0);

    const incomeThisMonth = claimedItems
      .filter((item) => isThisMonth(parseISO(item.claimedDate)))
      .reduce((sum, item) => sum + item.totalPrice, 0);

    const incomeThisYear = claimedItems
      .filter((item) => isThisYear(parseISO(item.claimedDate)))
      .reduce((sum, item) => sum + item.totalPrice, 0);

    const deliveredToday = claimedItems
        .filter(item => isToday(parseISO(item.claimedDate))).length;
    
    const deliveredThisMonth = claimedItems
        .filter(item => isThisMonth(parseISO(item.claimedDate))).length;
    
    const deliveredThisYear = claimedItems
        .filter(item => isThisYear(parseISO(item.claimedDate))).length;

    const totalDelivered = claimedItems.length;
    const totalIncome = claimedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      incomeToday,
      incomeThisMonth,
      incomeThisYear,
      deliveredToday,
      deliveredThisMonth,
      deliveredThisYear,
      totalDelivered,
      totalIncome
    };
  }, [claimedItems]);

  const stats = [
    {
      title: 'Ingresos de Hoy',
      value: formatCurrency(reportData.incomeToday),
      icon: DollarSign,
      description: `${reportData.deliveredToday} artículos entregados hoy`,
    },
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(reportData.incomeThisMonth),
      icon: Calendar,
      description: `${reportData.deliveredThisMonth} artículos este mes`,
    },
    {
      title: 'Ingresos del Año',
      value: formatCurrency(reportData.incomeThisYear),
      icon: TrendingUp,
      description: `${reportData.deliveredThisYear} artículos este año`,
    },
    {
      title: 'Total Histórico Entregado',
      value: reportData.totalDelivered.toString(),
      icon: PackageCheck,
      description: `Ingreso total de ${formatCurrency(reportData.totalIncome)}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Separator />

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Artículos Entregados (Papelera)</h2>
        {claimedItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {claimedItems.map((item) => (
              <ClaimedItemCard 
                key={item.id}
                item={item}
                onRestore={handleRestoreItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">La papelera está vacía.</p>
              <p className="text-sm text-muted-foreground">Cuando marques un artículo como "Recogido", aparecerá aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
}
