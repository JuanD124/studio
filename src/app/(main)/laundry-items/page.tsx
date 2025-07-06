import PriceList from '@/components/laundry-items/price-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lista de Precios - LavanderiaFacil',
  description: 'Gestiona tus artículos de lavandería y precios.',
};

export default function LaundryItemsPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Lista de Precios</h1>
        <p className="text-muted-foreground">Añade, edita y gestiona tus servicios y precios.</p>
      </div>
      <PriceList />
    </div>
  );
}
