import type { LaundryItem, StoredItem } from './types';

export const initialLaundryItems: LaundryItem[] = [
  { id: '1', name: 'Camisa (Lavado y Doblado)', price: 2.50 },
  { id: '2', name: 'Pantalones (Lavado y Doblado)', price: 3.00 },
  { id: '3', name: 'Chaqueta (Lavado en Seco)', price: 10.00 },
  { id: '4', name: 'Edredón (Grande)', price: 25.00 },
  { id: '5', name: 'Toalla', price: 1.50 },
];

export const initialStoredItems: StoredItem[] = [
  {
    id: 's1',
    customerName: 'Juan Pérez',
    itemsDescription: '1 maleta grande, negra',
    storageDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    storagePrice: 5.00,
    laundryItems: [
        { laundryItemId: '1', name: 'Camisa (Lavado y Doblado)', price: 2.50, quantity: 4 },
        { laundryItemId: '2', name: 'Pantalones (Lavado y Doblado)', price: 3.00, quantity: 2 }
    ],
    totalPrice: 21.00,
  },
  {
    id: 's2',
    customerName: 'Ana García',
    itemsDescription: '2 bolsas de lona, roja y azul',
    storageDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    storagePrice: 10.00,
    laundryItems: [],
    totalPrice: 10.00,
  },
    {
    id: 's3',
    customerName: 'Luis Rodríguez',
    itemsDescription: 'Funda de ropa con 3 trajes',
    storageDate: new Date().toISOString(), // Today
    storagePrice: 5.00,
    laundryItems: [
        { laundryItemId: '3', name: 'Chaqueta (Lavado en Seco)', price: 10.00, quantity: 3 }
    ],
    totalPrice: 35.00,
  },
];
