import StorageManager from '@/components/dashboard/storage-manager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Almacenamiento - LavanderiaFacil',
  description: 'Gestiona tus artículos almacenados.',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Panel de Almacenamiento</h1>
        <p className="text-muted-foreground">Rastrea y gestiona todos los artículos almacenados.</p>
      </div>
      <StorageManager />
    </div>
  );
}
