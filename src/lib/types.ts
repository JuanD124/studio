export interface LaundryItem {
  id: string;
  name: string;
  price: number;
}

export interface Payment {
  amount: number;
  date: string; // ISO string format
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
  payments: Payment[];
  remainingBalance: number;
}
