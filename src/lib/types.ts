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
  laundryItems: {
    laundryItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  payments: Payment[];
  remainingBalance: number;
  location?: string; // e.g., "Estante A-3"
  editedBy?: {
    username: string;
    date: string; // ISO string format
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
}
