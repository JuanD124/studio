'use client';

import * as React from 'react';
import { db, isFirebaseConfigInvalid } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, writeBatch, deleteDoc, where, getDocs, limit } from 'firebase/firestore';
import type { ClaimedItem, IncomeEntry, StoredItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, DollarSign, PackageCheck, TrendingUp, Package, Coins, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ClaimedItemCard } from './claimed-item-card';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, startOfMonth, startOfYear, endOfDay, endOfMonth, endOfYear, isWithinInterval, subDays } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/button';

export default function ReportsView() {
    const { user } = useAuth();
    const [claimedItems, setClaimedItems] = React.useState<ClaimedItem[]>([]);
    const [incomeEntries, setIncomeEntries] = React.useState<IncomeEntry[]>([]);
    const { toast } = useToast();

    React.useEffect(() => {
        if (!db) return;

        const claimedQuery = query(
            collection(db, "claimedItems"), 
            orderBy("claimedDate", "desc")
        );

        const unsubscribeClaimed = onSnapshot(claimedQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ClaimedItem[];
            setClaimedItems(items);
        });
        
        const incomeQuery = query(collection(db, "incomeEntries"), orderBy("date", "desc"));
        const unsubscribeIncome = onSnapshot(incomeQuery, (snapshot) => {
            let entries: IncomeEntry[] = [];
            snapshot.forEach(doc => {
                entries.push(doc.data() as IncomeEntry);
            });
            setIncomeEntries(entries);
        });

        return () => {
            unsubscribeClaimed();
            unsubscribeIncome();
        };
    }, []);
    
    const handleRestoreItem = React.useCallback(async (itemToRestore: ClaimedItem) => {
        if (!db) return;
    
        const { claimedDate, ...originalItemData } = itemToRestore;
    
        try {
            const batch = writeBatch(db);
    
            const storedItemRef = doc(db, 'storedItems', itemToRestore.id);
            batch.set(storedItemRef, originalItemData as StoredItem);
    
            const claimedItemRef = doc(db, 'claimedItems', itemToRestore.id);
            batch.delete(claimedItemRef);

            const incomeQuery = query(
                collection(db, 'incomeEntries'), 
                where('itemId', '==', itemToRestore.id),
                where('type', '==', 'Entrega')
            );

            const incomeSnapshot = await getDocs(incomeQuery);
            if (!incomeSnapshot.empty) {
                incomeSnapshot.forEach(incomeDoc => {
                    batch.delete(incomeDoc.ref);
                });
            }
    
            await batch.commit();
    
            toast({
                title: "Artículo Restaurado",
                description: "El artículo ha vuelto al almacén y el ingreso final ha sido anulado.",
            });
        } catch (error) {
            console.error("Error al restaurar el artículo: ", error);
            toast({
                title: "Error",
                description: "No se pudo restaurar el artículo.",
                variant: "destructive",
            });
        }
    }, [toast]);

    const handleDeleteItem = React.useCallback(async (id: string) => {
        if (!db) return;
        if (!window.confirm("¿Estás seguro de que quieres eliminar este artículo permanentemente? Esta acción no se puede deshacer.")) {
            return;
        }
        try {
            await deleteDoc(doc(db, "claimedItems", id));
            toast({
                title: "Artículo Eliminado",
                description: "El artículo ha sido eliminado permanentemente de la papelera.",
                variant: 'destructive',
            });
        } catch (error) {
            console.error("Error al eliminar el artículo: ", error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el artículo.",
                variant: "destructive",
            });
        }
    }, [toast]);
    
    const handlePurgeOldestItems = React.useCallback(async () => {
        if (!db) return;
        if (!window.confirm("¿Estás seguro de que quieres eliminar permanentemente los 30 artículos más antiguos de la papelera? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            const oldestItemsQuery = query(
                collection(db, "claimedItems"),
                orderBy("claimedDate", "asc"), // Oldest first
                limit(30)
            );

            const snapshot = await getDocs(oldestItemsQuery);
            if (snapshot.empty) {
                toast({ title: "Información", description: "No hay artículos antiguos que purgar." });
                return;
            }

            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();

            toast({
                title: "Purga Exitosa",
                description: `Se han eliminado ${snapshot.size} artículos antiguos de la papelera.`,
            });
        } catch (error) {
            console.error("Error al purgar artículos antiguos: ", error);
            toast({
                title: "Error",
                description: "No se pudieron eliminar los artículos antiguos.",
                variant: "destructive",
            });
        }
    }, [toast]);

    const calculateTotalIncome = React.useCallback((entries: IncomeEntry[], startDate: Date, endDate: Date, type: 'Abono' | 'Entrega' | 'Ambos') => {
        return entries
            .filter(entry => {
                const entryDate = new Date(entry.date);
                const isWithin = isWithinInterval(entryDate, { start: startDate, end: endDate });
                if (!isWithin) return false;
                if (type === 'Ambos') return true;
                return entry.type === type;
            })
            .reduce((sum, entry) => sum + entry.amount, 0);
    }, []);

    const now = new Date();
    const todayInterval = { start: startOfDay(now), end: endOfDay(now) };

    const ingresosEmpleadoHoy = calculateTotalIncome(incomeEntries, todayInterval.start, todayInterval.end, 'Abono');

    const abonosHoy = calculateTotalIncome(incomeEntries, todayInterval.start, todayInterval.end, 'Abono');
    const abonosMes = calculateTotalIncome(incomeEntries, startOfMonth(now), endOfMonth(now), 'Abono');
    const abonosAnio = calculateTotalIncome(incomeEntries, startOfYear(now), endOfYear(now), 'Abono');
    
    const ingresosPorEntregaHoy = calculateTotalIncome(incomeEntries, todayInterval.start, todayInterval.end, 'Entrega');
    
    const displayClaimedItems = React.useMemo(() => {
        const thirtyDaysAgo = subDays(new Date(), 30);
        return claimedItems.filter(item => new Date(item.claimedDate) >= thirtyDaysAgo);
    }, [claimedItems]);

    if (isFirebaseConfigInvalid) {
        return (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de Configuración de Firebase</AlertTitle>
            <AlertDescription>
              La aplicación no puede conectarse a la base de datos. Por favor, asegúrate de que has introducido
              tus credenciales de Firebase en el archivo <strong>src/lib/firebase.ts</strong>.
            </AlertDescription>
          </Alert>
        );
    }
    
    if (user?.role === 'empleado') {
        return (
             <Card className="lg:col-span-4 bg-primary/10 border-primary/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">Total a Recaudar Hoy</CardTitle>
                    <Coins className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(ingresosEmpleadoHoy)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Suma de todos los abonos recibidos en el día.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-semibold mb-4">Resumen de Ingresos (Abonos)</h2>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="lg:col-span-1 bg-primary/10 border-primary/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">Ingresos por Abonos (Hoy)</CardTitle>
                            <Coins className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{formatCurrency(abonosHoy)}</div>
                             <p className="text-xs text-muted-foreground mt-1">
                                Dinero que entró a caja hoy.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ingresos pendientes por Entrega (hoy)</CardTitle>
                            <PackageCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(ingresosPorEntregaHoy)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Suma de saldos liquidados al entregar artículos hoy.
                            </p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Abonos (Mes)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(abonosMes)}</div>
                             <p className="text-xs text-muted-foreground mt-1">
                                Suma de abonos durante el mes.
                            </p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Abonos (Año)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(abonosAnio)}</div>
                             <p className="text-xs text-muted-foreground mt-1">
                                Suma de abonos durante el año.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
            
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Artículos Entregados Recientemente (Papelera)</h2>
                    <Button variant="outline" size="sm" onClick={handlePurgeOldestItems}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Purgar 30 más antiguos
                    </Button>
                </div>
                {displayClaimedItems.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displayClaimedItems.map((item) => (
                           <ClaimedItemCard 
                                key={item.id}
                                item={item}
                                onRestore={handleRestoreItem}
                                onDelete={handleDeleteItem}
                           />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">La papelera está vacía.</p>
                        <p className="text-sm text-muted-foreground">Los artículos entregados en los últimos 30 días aparecerán aquí.</p>
                    </div>
                )}
            </section>
        </div>
    );
}