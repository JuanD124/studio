'use client';

import * as React from 'react';
import { db, isFirebaseConfigInvalid } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, writeBatch, deleteDoc, where, getDocs } from 'firebase/firestore';
import type { ClaimedItem, IncomeEntry, StoredItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, DollarSign, PackageCheck, TrendingUp, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ClaimedItemCard } from './claimed-item-card';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, startOfMonth, startOfYear, endOfDay, endOfMonth, endOfYear, isWithinInterval } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function ReportsView() {
    const [claimedItems, setClaimedItems] = React.useState<ClaimedItem[]>([]);
    const [incomeEntries, setIncomeEntries] = React.useState<IncomeEntry[]>([]);
    const { toast } = useToast();

    React.useEffect(() => {
        if (!db) return;

        const claimedQuery = query(collection(db, "claimedItems"), orderBy("claimedDate", "desc"));
        const unsubscribeClaimed = onSnapshot(claimedQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ClaimedItem[];
            setClaimedItems(items);
        });
        
        const incomeQuery = query(collection(db, "incomeEntries"), orderBy("date", "desc"));
        const unsubscribeIncome = onSnapshot(incomeQuery, (snapshot) => {
            const entries = snapshot.docs.map(doc => doc.data()) as IncomeEntry[];
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
        if (!window.confirm("¿Estás seguro de que quieres eliminar este artículo permanentemente? Esta acción no se puede deshacer y no afectará los reportes de ingresos ya registrados.")) {
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

    const calculateTotalIncome = React.useCallback((entries: IncomeEntry[], startDate: Date, endDate: Date, type: 'Abono' | 'Entrega' | 'Ambos') => {
        return entries
            .filter(entry => {
                const entryDate = new Date(entry.date);
                const isWithinDate = isWithinInterval(entryDate, { start: startDate, end: endDate });
                if (!isWithinDate) return false;
                if (type === 'Ambos') return true;
                return entry.type === type;
            })
            .reduce((sum, entry) => sum + entry.amount, 0);
    }, []);

    const now = new Date();
    const abonosHoy = calculateTotalIncome(incomeEntries, startOfDay(now), endOfDay(now), 'Abono');
    const abonosMes = calculateTotalIncome(incomeEntries, startOfMonth(now), endOfMonth(now), 'Abono');
    const abonosAnio = calculateTotalIncome(incomeEntries, startOfYear(now), endOfYear(now), 'Abono');
    const entregasMes = calculateTotalIncome(incomeEntries, startOfMonth(now), endOfMonth(now), 'Entrega');
    
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

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-semibold mb-4">Resumen de Ingresos por Abonos</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Abonos de Hoy</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(abonosHoy)}</div>
                        </CardContent>
                    </Card>
                     <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Abonos de este Mes</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(abonosMes)}</div>
                        </CardContent>
                    </Card>
                     <Card className="lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Abonos de este Año</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(abonosAnio)}</div>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-1 bg-primary/10 border-primary/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total por Entregas (Mes)</CardTitle>
                            <PackageCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(entregasMes)}</div>
                        </CardContent>
                    </Card>
                </div>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold mb-4">Artículos Entregados Recientemente</h2>
                {claimedItems.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">La papelera está vacía.</p>
                        <p className="text-sm text-muted-foreground">Los artículos marcados como "entregados" aparecerán aquí.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
