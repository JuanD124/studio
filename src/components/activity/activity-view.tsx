'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs, writeBatch, where } from 'firebase/firestore';
import type { ActivityLogEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, User, Edit, PlusCircle, PackageCheck, Banknote, MapPin, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

const ACTION_ICONS: { [key in ActivityLogEntry['action']]: React.ElementType } = {
  created: PlusCircle,
  edited: Edit,
  payment_added: Banknote,
  payment_edited: Banknote,
  claimed: PackageCheck,
  restored: RotateCcw,
  deleted: Trash2,
  purged: Trash2,
  location_changed: MapPin,
};

const ACTION_COLORS: { [key in ActivityLogEntry['action']]: string } = {
    created: 'text-green-500',
    edited: 'text-blue-500',
    payment_added: 'text-teal-500',
    payment_edited: 'text-cyan-500',
    claimed: 'text-purple-500',
    restored: 'text-orange-500',
    deleted: 'text-red-500',
    purged: 'text-red-700',
    location_changed: 'text-indigo-500',
};

export default function ActivityView() {
    const [allActivities, setAllActivities] = React.useState<ActivityLogEntry[]>([]);
    const [todaysActivities, setTodaysActivities] = React.useState<ActivityLogEntry[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isPurging, setIsPurging] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        if (!db) return;

        const q = query(collection(db, 'activityLog'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const activityData: ActivityLogEntry[] = [];
            querySnapshot.forEach((doc) => {
                activityData.push({ id: doc.id, ...doc.data() } as ActivityLogEntry);
            });
            setAllActivities(activityData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    React.useEffect(() => {
        setTodaysActivities(allActivities.filter(activity => isToday(new Date(activity.date))));
    }, [allActivities]);
    
    const handlePurgeOldActivity = async () => {
        if (!db) return;
        if (!window.confirm("¿Estás seguro de que quieres eliminar toda la actividad que no sea de hoy? Esta acción no se puede deshacer.")) {
            return;
        }

        setIsPurging(true);
        try {
            const todayStart = startOfToday().toISOString();
            const oldActivityQuery = query(collection(db, 'activityLog'), where('date', '<', todayStart));
            const snapshot = await getDocs(oldActivityQuery);

            if (snapshot.empty) {
                toast({ title: "Información", description: "No hay actividad antigua para purgar." });
                setIsPurging(false);
                return;
            }

            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            toast({ title: "Éxito", description: `Se han eliminado ${snapshot.size} registros antiguos.` });
        } catch (error) {
            console.error("Error al purgar la actividad:", error);
            toast({ title: "Error", description: "No se pudo purgar la actividad antigua.", variant: "destructive" });
        } finally {
            setIsPurging(false);
        }
    };


    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Actividad de Hoy</CardTitle>
                 <Button variant="outline" size="sm" onClick={handlePurgeOldActivity} disabled={isPurging}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isPurging ? 'Purgando...' : 'Purgar Actividad Antigua'}
                </Button>
            </CardHeader>
            <CardContent>
                {todaysActivities.length === 0 ? (
                     <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <History className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No hay actividad registrada hoy</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Las acciones que se realicen durante el día aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="relative pl-6">
                        {/* Vertical line */}
                        <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-3"></div>

                        {todaysActivities.map((activity) => {
                            const Icon = ACTION_ICONS[activity.action] || History;
                            const iconColor = ACTION_COLORS[activity.action] || 'text-gray-500';

                            return (
                                <div key={activity.id} className="relative flex items-start space-x-4 pb-8">
                                    <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-background -translate-x-1/2">
                                        <Icon className={`h-5 w-5 ${iconColor}`} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(activity.date), "d MMM yyyy, HH:mm:ss", { locale: es })}
                                        </p>
                                        <p className="mt-0.5 text-base">
                                            <span className="font-semibold">{activity.user}</span> {activity.details}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
