import StorageManager from '@/components/dashboard/storage-manager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Lanzaexpres',
  description: 'Manage your stored items.',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Storage Dashboard</h1>
        <p className="text-muted-foreground">Keep track and manage all stored items.</p>
      </div>
      <StorageManager />
    </div>
  );
}
