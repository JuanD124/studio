'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import type { StoredItem } from '@/lib/types';
import { Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: StoredItem | null;
}

export function InvoiceDialog({ isOpen, onClose, item }: InvoiceDialogProps) {
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (printContent) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Invoice</title>');
        printWindow.document.write('<style> body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } .text-right { text-align: right; } .font-bold { font-weight: bold; } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Invoice - Item ID: {item.id}</DialogTitle>
          <DialogDescription>
            Review the details before printing the invoice.
          </DialogDescription>
        </DialogHeader>
        
        <div ref={invoiceRef} className="py-4">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Invoice</h2>
          <div style={{ marginBottom: '1rem' }}>
            <p><strong>Item ID:</strong> {item.id}</p>
            <p><strong>Customer Name:</strong> {item.customerName}</p>
            <p><strong>Storage Date:</strong> {new Date(item.storageDate).toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Storage: {item.itemsDescription}</td>
                <td className="text-right">{formatCurrency(item.storagePrice)}</td>
              </tr>
              {item.laundryItems && item.laundryItems.map((laundryItem, index) => (
                <tr key={index}>
                    <td>Laundry: {laundryItem.quantity}x {laundryItem.name}</td>
                    <td className="text-right">{formatCurrency(laundryItem.price * laundryItem.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="font-bold">Total Price</td>
                <td className="text-right font-bold">{formatCurrency(item.totalPrice)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          <Button type="button" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/>Print Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
