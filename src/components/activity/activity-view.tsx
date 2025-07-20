'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { ActivityLogEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, User, Edit, PlusCircle, PackageCheck, Banknote, MapPin, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

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

type FilterType = 'all' | 'today';

export default function ActivityView() {
    const [allActivities, setAllActivities] = React.useState<ActivityLogEntry[]>([]);
    const [filteredActivities, setFilteredActivities] = React.useState<ActivityLogEntry[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeFilter, setActiveFilter] = React.useState<FilterType>('all');

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
        if (activeFilter === 'today') {
            setFilteredActivities(allActivities.filter(activity => isToday(new Date(activity.date))));
        } else {
            setFilteredActivities(allActivities);
        }
    }, [allActivities, activeFilter]);

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
            <CardHeader className='flex-row items-center justify-between'>
                <CardTitle>Últimas Actividades</CardTitle>
                <div className="flex items-center gap-2">
                    <Button 
                        variant={activeFilter === 'all' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('all')}
                    >
                        Toda
                    </Button>
                    <Button 
                        variant={activeFilter === 'today' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setActiveFilter('today')}
                    >
                        Hoy
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {filteredActivities.length === 0 ? (
                     <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <History className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No hay actividad registrada</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                        {activeFilter === 'today'
                            ? 'No se han realizado acciones hoy.'
                            : 'Las acciones como crear o editar artículos aparecerán aquí.'
                        }
                        </p>
                    </div>
                ) : (
                    <div className="relative pl-6">
                        {/* Vertical line */}
                        <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2 ml-3"></div>

                        {filteredActivities.map((activity) => {
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
