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
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Factura</title>');
            printWindow.document.write(`
                <style>
                    body { font-family: 'PT Sans', sans-serif; margin: 0; padding: 0; color: #333; }
                    .invoice-box { width: 100%; max-width: 800px; margin: auto; padding: 30px; font-size: 16px; line-height: 24px; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 1rem; }
                    .header-brand { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: bold; }
                    .details { margin-bottom: 2rem; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .details-item { }
                    .details-item strong { display: block; margin-bottom: 0.25rem; color: #555; }
                    .charges-summary { margin-top: 2rem; }
                    .charges-summary h3 { font-size: 1.1rem; font-weight: bold; margin-bottom: 1rem; }
                    .charge-item, .total-item { display: flex; justify-content: space-between; padding: 0.5rem 0; }
                    .charge-item { border-bottom: 1px solid #eee; }
                    .laundry-list { list-style: none; padding-left: 1.5rem; margin-top: 0.5rem; }
                    .laundry-list li { display: flex; justify-content: space-between; color: #555; font-size: 0.9rem; }
                    .total-item { font-weight: bold; font-size: 1.2rem; border-top: 2px solid #333; margin-top: 1rem; }
                    .brand-icon { width: 32px; height: 32px; color: #007bff; }
                    @media print {
                      body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Factura - ID: {item.id.substring(0, 6)}</DialogTitle>
          <DialogDescription>
            Revisa los detalles antes de imprimir la factura.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-1">
            <div ref={invoiceRef} className="invoice-box">
                <div className="header">
                    <div className="header-brand">
                        <svg className="brand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4.5A2.5 2.5 0 015.5 2h13A2.5 2.5 0 0121 4.5v11.75a.75.75 0 01-1.5 0V11a1 1 0 00-1-1H5a1 1 0 00-1 1v5.25a.75.75 0 01-1.5 0V4.5zM8 8a1 1 0 100-2 1 1 0 000 2zm-2 4a1 1 0 11-2 0 1 1 0 012 0zm10-4a1 1 0 100-2 1 1 0 000 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14a2 2 0 100-4 2 2 0 000 4z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18h12v4H6v-4z"></path></svg>
                        <span>LavanderiaFacil</span>
                    </div>
                    <div>
                        <p><strong>Factura ID:</strong> {item.id.substring(0, 6)}</p>
                        <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-CO')}</p>
                    </div>
                </div>

                <div className="details details-grid">
                    <div className="details-item">
                        <strong>Cliente:</strong>
                        <p>{item.customerName}</p>
                        {item.rank && <p>{item.rank}</p>}
                        {item.battalion && <p>{item.battalion}</p>}
                        {item.contingent && <p>Cont. {item.contingent}</p>}
                    </div>
                     <div className="details-item">
                        <strong>Detalles de Almacenamiento:</strong>
                        <p><strong>Fecha:</strong> {new Date(item.storageDate).toLocaleDateString('es-CO')}</p>
                        <p><strong>Descripción:</strong> {item.itemsDescription}</p>
                        {item.ticketColor && <p><strong>Ticket:</strong> {item.ticketColor}</p>}
                    </div>
                </div>

                <div className="charges-summary">
                    <h3>Resumen de Cargos</h3>
                    <div className="charge-item">
                        <span>Cargo por Almacenamiento</span>
                        <span>{formatCurrency(item.storagePrice)}</span>
                    </div>

                    {item.laundryItems && item.laundryItems.length > 0 && (
                        <div className="charge-item">
                            <div>
                                <span>Servicios de Lavandería</span>
                                <ul className="laundry-list">
                                    {item.laundryItems.map((laundryItem, index) => (
                                        <li key={index}>
                                            <span>{laundryItem.quantity} &times; {laundryItem.name}</span>
                                            <span>{formatCurrency(laundryItem.price * laundryItem.quantity)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <div className="total-item">
                        <span>TOTAL A PAGAR</span>
                        <span>{formatCurrency(item.totalPrice)}</span>
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cerrar</Button>
            <Button type="button" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/>Imprimir Factura</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
