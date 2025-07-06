import type { LaundryItem, StoredItem } from './types';

export const initialLaundryItems: LaundryItem[] = [
  { id: '1', name: 'Camisa (Lavado y Doblado)', price: 5000 },
  { id: '2', name: 'Pantalones (Lavado y Doblado)', price: 6000 },
  { id: '3', name: 'Chaqueta (Lavado en Seco)', price: 20000 },
  { id: '4', name: 'Edredón (Grande)', price: 50000 },
  { id: '5', name: 'Toalla', price: 3000 },
];

export const initialStoredItems: StoredItem[] = [
  {
    id: 's1',
    customerName: 'Juan Pérez',
    itemsDescription: '1 maleta grande, negra',
    storageDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    storagePrice: 10000,
    laundryItems: [
        { laundryItemId: '1', name: 'Camisa (Lavado y Doblado)', price: 5000, quantity: 4 },
        { laundryItemId: '2', name: 'Pantalones (Lavado y Doblado)', price: 6000, quantity: 2 }
    ],
    totalPrice: 42000,
  },
  {
    id: 's2',
    customerName: 'Ana García',
    itemsDescription: '2 bolsas de lona, roja y azul',
    storageDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    storagePrice: 20000,
    laundryItems: [],
    totalPrice: 20000,
  },
    {
    id: 's3',
    customerName: 'Luis Rodríguez',
    itemsDescription: 'Funda de ropa con 3 trajes',
    storageDate: new Date().toISOString(), // Today
    storagePrice: 10000,
    laundryItems: [
        { laundryItemId: '3', name: 'Chaqueta (Lavado en Seco)', price: 20000, quantity: 3 }
    ],
    totalPrice: 70000,
  },
];
