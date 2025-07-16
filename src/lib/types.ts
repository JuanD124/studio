export interface LaundryItem {
  id: string;
  name: string;
  price: number;
}

export interface StoredItem {
  id: string; // Firestore document ID
  customerName: string;
  customerId?: string;
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
    type: 'Entrega';
}
