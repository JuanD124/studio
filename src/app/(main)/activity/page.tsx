'use client'

import ActivityView from '@/components/activity/activity-view';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function ActivityPage() {
    const { user } = useAuth();
  
    if (user?.role !== 'gerente') {
        return (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Acceso Denegado</AlertTitle>
                <AlertDescription>
                    No tienes permiso para ver esta página. Por favor, contacta a un administrador.
                </AlertDescription>
            </Alert>
        )
    }

    return (
      <div className="container mx-auto">
        <div className="mb-6">
            <h1 className="text-3xl font-bold font-headline">
                Registro de Actividad
            </h1>
            <p className="text-muted-foreground">
                Un registro de todas las acciones importantes realizadas en el sistema.
            </p>
        </div>
        <ActivityView />
      </div>
    );
  }
