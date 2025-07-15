'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, writeBatch, deleteDoc, setDoc } from 'firebase/firestore';
import type { StoredItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ClaimedItemCard } from './claimed-item-card';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, startOfMonth, startOfYear } from 'date-fns';

type ClaimedItem = StoredItem & { claimedDate: string };

export default function ReportsView() {
    const [claimedItems, setClaimedItems] = React.useState<ClaimedItem[]>([]);
    const { toast } = useToast();

    React.useEffect(() => {
        const q = query(collection(db, "claimedItems"), orderBy("claimedDate", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ClaimedItem[];
            setClaimedItems(items);
        });
        return () => unsubscribe();
    }, []);
    
    const handleRestoreItem = async (itemToRestore: ClaimedItem) => {
        try {
            const { claimedDate, ...originalItemData } = itemToRestore;

            const batch = writeBatch(db);
            
            // Restore to storedItems with the same ID
            const storedItemRef = doc(db, 'storedItems', itemToRestore.id);
            batch.set(storedItemRef, originalItemData);
            
            // Delete from claimedItems
            const claimedItemRef = doc(db, 'claimedItems', itemToRestore.id);
            batch.delete(claimedItemRef);
            
            await batch.commit();

            toast({
                title: "Artículo Restaurado",
                description: "El artículo ha sido devuelto al panel de almacenamiento.",
            });
        } catch (error) {
            console.error("Error al restaurar el artículo: ", error);
            toast({
                title: "Error",
                description: "No se pudo restaurar el artículo.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este artículo permanentemente? Esta acción no se puede deshacer.")) {
            return;
        }
        try {
            await deleteDoc(doc(db, "claimedItems", id));
            toast({
                title: "Artículo Eliminado",
                description: "El artículo ha sido eliminado permanentemente.",
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
    };

    const calculateTotal = (items: ClaimedItem[], startDate: Date) => {
        return items
            .filter(item => new Date(item.claimedDate) >= startDate)
            .reduce((sum, item) => sum + item.totalPrice, 0);
    };

    const now = new Date();
    const totalHoy = calculateTotal(claimedItems, startOfDay(now));
    const totalMes = calculateTotal(claimedItems, startOfMonth(now));
    const totalAnio = calculateTotal(claimedItems, startOfYear(now));

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-semibold mb-4">Resumen de Ingresos</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos de Hoy</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalHoy)}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos de este Mes</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalMes)}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos de este Año</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalAnio)}</div>
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
