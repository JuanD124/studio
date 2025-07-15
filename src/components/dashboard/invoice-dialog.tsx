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
        const printWindow = window.open('', '', 'height=800,width=400');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Factura</title>');
            printWindow.document.write(`
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap');
                    body { 
                        font-family: 'Inconsolata', monospace;
                        margin: 0; 
                        padding: 0; 
                        color: #000;
                        background-color: #fff;
                    }
                    .receipt { 
                        width: 302px; /* 80mm receipt paper width */
                        margin: auto; 
                        padding: 15px;
                        font-size: 13px; 
                        line-height: 1.4;
                    }
                    .header { 
                        text-align: center; 
                        margin-bottom: 10px; 
                    }
                    .header h2 {
                        margin: 0;
                        font-size: 18px;
                        font-weight: 700;
                    }
                    .header p {
                        margin: 2px 0;
                        font-size: 12px;
                    }
                    .hr {
                        border: 0;
                        border-top: 1px dashed #000;
                        margin: 10px 0;
                    }
                    .details p {
                        margin: 2px 0;
                    }
                    .details p strong {
                        display: inline-block;
                        width: 70px;
                    }
                    .item-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    .item-table th, .item-table td {
                        padding: 5px 0;
                    }
                    .item-table th {
                        text-align: left;
                        border-bottom: 1px dashed #000;
                    }
                    .item-table .item-name {
                        text-align: left;
                    }
                    .item-table .item-price, .item-table .item-total {
                        text-align: right;
                    }
                    .totals-table {
                         width: 100%;
                         margin-top: 10px;
                    }
                    .totals-table td {
                        padding: 3px 0;
                    }
                    .totals-table .label {
                        text-align: left;
                    }
                     .totals-table .value {
                        text-align: right;
                    }
                    .totals-table .total-row td {
                        font-weight: 700;
                        font-size: 15px;
                        border-top: 1px dashed #000;
                        padding-top: 5px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 15px;
                        font-size: 11px;
                    }
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Factura - Ticket No. {item.ticketNumber}</DialogTitle>
          <DialogDescription>
            Revisa los detalles antes de imprimir la factura.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-1 bg-gray-100 rounded-md">
            <div ref={invoiceRef} className="receipt">
                <div className="header">
                    <h2>Lanzaexpres</h2>
                </div>

                <div className="hr"></div>

                <div className="details">
                    <p><strong>Ticket:</strong> {item.ticketNumber}</p>
                    <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-CO', {day: '2-digit', month: '2-digit', year: 'numeric'})}</p>
                    <p><strong>Cliente:</strong> {item.customerName}</p>
                    {item.rank && <p><strong>Rango:</strong> {item.rank}</p>}
                </div>

                <div className="hr"></div>

                <table className="item-table">
                    <thead>
                        <tr>
                            <th className="item-name">Descripción</th>
                            <th className="item-total">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="item-name">Almacenamiento: {item.itemsDescription}</td>
                            <td className="item-total">{formatCurrency(item.storagePrice)}</td>
                        </tr>
                        {item.laundryItems && item.laundryItems.map((laundryItem, index) => (
                           <tr key={index}>
                               <td className="item-name">{laundryItem.quantity}x {laundryItem.name}</td>
                               <td className="item-total">{formatCurrency(laundryItem.price * laundryItem.quantity)}</td>
                           </tr>
                       ))}
                    </tbody>
                </table>

                 <div className="hr"></div>

                <table className="totals-table">
                    <tbody>
                        <tr className="total-row">
                            <td className="label">TOTAL:</td>
                            <td className="value">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div className="hr"></div>

                <div className="footer">
                    <p>¡Gracias por su preferencia!</p>
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
