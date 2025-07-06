import type { LaundryItem, StoredItem } from './types';

export const initialLaundryItems: LaundryItem[] = [
  { id: '1', name: 'Shirt (Wash & Fold)', price: 2.50 },
  { id: '2', name: 'Pants (Wash & Fold)', price: 3.00 },
  { id: '3', name: 'Jacket (Dry Clean)', price: 10.00 },
  { id: '4', name: 'Comforter (Large)', price: 25.00 },
  { id: '5', name: 'Towel', price: 1.50 },
];

export const initialStoredItems: StoredItem[] = [
  {
    id: 's1',
    customerName: 'John Doe',
    itemsDescription: '1 Large suitcase, black',
    storageDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 's2',
    customerName: 'Jane Smith',
    itemsDescription: '2 duffel bags, red and blue',
    storageDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
    {
    id: 's3',
    customerName: 'Peter Jones',
    itemsDescription: 'Garment bag with 3 suits',
    storageDate: new Date().toISOString(), // Today
  },
];
