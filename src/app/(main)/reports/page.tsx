import ReportsView from '@/components/reports/reports-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reportes y Papelera - LavanderiaFacil',
  description: 'Ver reportes de ingresos y gestionar artículos entregados.',
};

export default function ReportsPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Reportes y Papelera</h1>
        <p className="text-muted-foreground">Analiza los ingresos y gestiona los artículos ya entregados.</p>
      </div>
      <ReportsView />
    </div>
  );
}
