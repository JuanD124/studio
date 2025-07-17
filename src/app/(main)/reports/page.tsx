'use client'

import ReportsView from '@/components/reports/reports-view';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Reportes y Papelera - Lanzaexpres',
//   description: 'Revisa los artículos entregados y las ganancias.',
// };

export default function ReportsPage() {
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
            <h1 className="text-3xl font-bold font-headline">Reportes y Papelera</h1>
            <p className="text-muted-foreground">Revisa los artículos entregados y las ganancias.</p>
        </div>
        <ReportsView />
      </div>
    );
  }
