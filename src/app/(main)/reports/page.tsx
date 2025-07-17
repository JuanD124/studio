'use client'

import ReportsView from '@/components/reports/reports-view';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function ReportsPage() {
    const { user } = useAuth();
  
    if (!user) {
        return null; // or a loading spinner
    }

    // Gerente sees full reports, Empleado sees a simplified view
    return (
      <div className="container mx-auto">
        <div className="mb-6">
            <h1 className="text-3xl font-bold font-headline">
                {user.role === 'gerente' ? 'Reportes y Papelera' : 'Cierre de Caja Diario'}
            </h1>
            <p className="text-muted-foreground">
                {user.role === 'gerente' 
                    ? 'Revisa los artículos entregados y las ganancias.' 
                    : 'Resumen del dinero que debes entregar al final del día.'
                }
            </p>
        </div>
        <ReportsView />
      </div>
    );
  }
