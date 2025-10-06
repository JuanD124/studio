export interface LaundryItem {
  id: string;
  name: string;
  price: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string; // ISO string format
  createdBy: string;
  method: 'Efectivo' | 'Transferencia';
  editedBy?: {
    username: string;
    date: string; // ISO string format
  };
}

export interface StoredItemLaundryItem {
  laundryItemId: string;
  name: string;
  price: number;
  quantity: number;
  status: 'pending' | 'ready';
}

export interface StoredItem {
  id: string; // Firestore document ID, now will be a sequential number as string
  customerName: string;
  customerId?: string;
  customerPhone?: string;
  rank: string;
  battalion?: string;
  contingent?: string;
  color: string;
  itemsDescription: string;
  storageDate: string; // ISO string format
  storagePrice: number;
  laundryItems: StoredItemLaundryItem[];
  totalPrice: number;
  payments: Payment[];
  remainingBalance: number;
  location?: string; // e.g., "Estante A-3"
  serviceType: 'guardado' | 'lavado';
  editedBy?: {
    username: string;
    date: string; // ISO string format
    changeDetails?: string;
  };
}

// Represents an item that has been claimed/delivered
export type ClaimedItem = StoredItem & {
  claimedDate: string; // ISO string format
};

// Represents a single income transaction (payment or final claim payment)
export interface IncomeEntry {
    amount: number;
    date: string; // ISO string format
    itemId: string;
    customerName: string;
    type: 'Abono' | 'Entrega';
    method: 'Efectivo' | 'Transferencia';
}

export interface ActivityLogEntry {
  id: string;
  date: string; // ISO string format
  user: string;
  action: 'created' | 'edited' | 'payment_added' | 'payment_edited' | 'claimed' | 'restored' | 'deleted' | 'purged' | 'location_changed';
  itemId: string;
  details: string; // e.g., "Item for John Doe created."
}
