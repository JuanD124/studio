import StorageManager from '@/components/dashboard/storage-manager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Control - Lanzaexpres',
  description: 'Gestiona tus artículos almacenados.',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <StorageManager />
    </div>
  );
}
