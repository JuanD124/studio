'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { ClaimedItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, PackageCheck, Calendar, TrendingUp } from 'lucide-react';
import { isToday, isThisMonth, isThisYear, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

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
                claimedDate: data.claimedDate,
                storageDate: data.storageDate,
            } as ClaimedItem);
        });
        setClaimedItems(itemsData);
    });
    return () => unsubscribe();
  }, []);

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
      title: 'Total Entregado',
      value: reportData.totalDelivered.toString(),
      icon: PackageCheck,
      description: `Ingreso total de ${formatCurrency(reportData.totalIncome)}`,
    },
  ];

  return (
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
       {claimedItems.length === 0 && (
        <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No hay datos de reportes todavía.</p>
            <p className="text-sm text-muted-foreground">Cuando marques un artículo como "Recogido", aparecerán las estadísticas aquí.</p>
        </div>
       )}
    </div>
  );
}
