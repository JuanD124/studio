import PriceList from '@/components/laundry-items/price-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Price List - Lanzaexpres',
  description: 'Manage your laundry items and prices.',
};

export default function LaundryItemsPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Price List</h1>
        <p className="text-muted-foreground">Add, edit, and manage your services and prices.</p>
      </div>
      <PriceList />
    </div>
  );
}
