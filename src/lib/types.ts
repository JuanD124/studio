export interface LaundryItem {
  id: string;
  name: string;
  price: number;
}

export interface StoredItem {
  id: string;
  customerName: string;
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
