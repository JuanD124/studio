export interface LaundryItem {
  id: string;
  name: string;
  price: number;
}

export interface StoredItem {
  id: string; // Firestore document ID
  ticketNumber: number;
  customerName: string;
  rank?: string;
  battalion?: string;
  contingent?: string;
  ticketColor?: string;
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

export interface ClaimedItem extends Omit<StoredItem, 'id'> {
  id: string; // Firestore document ID of claimed item
  claimedDate: string; // ISO string format
}

export interface Counter {
    id: string;
    value: number;
}
