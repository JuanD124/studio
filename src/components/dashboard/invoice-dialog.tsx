
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
import { format } from 'date-fns';

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: StoredItem | null;
}

// --- Thermal Printer Receipt Component ---
// This component is designed to generate a plain text receipt
// suitable for a 58mm thermal printer.
const ThermalReceipt = React.forwardRef<HTMLDivElement, { item: StoredItem }>(({ item }, ref) => {
    const LINE_WIDTH = 32; // Characters for a 58mm receipt

    const padLine = (left: string, right: string): string => {
        const leftTrunc = left.substring(0, LINE_WIDTH - right.length - 1);
        const spaces = ' '.repeat(LINE_WIDTH - leftTrunc.length - right.length);
        return `${leftTrunc}${spaces}${right}`;
    };

    const center = (text: string): string => {
        const spaces = ' '.repeat(Math.max(0, Math.floor((LINE_WIDTH - text.length) / 2)));
        return `${spaces}${text}`;
    };

    const separator = '-'.repeat(LINE_WIDTH);

    const totalPaid = item.payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div ref={ref} className="thermal-receipt">
            <pre>
                {center('LanzaExpress')}\n
                {center('Contacto: 3157276196')}\n
                {new Date().toLocaleString('es-CO')}\n
                {separator}\n
                ID Ticket: {item.id}\n
                Cliente: {item.customerName}\n
                {item.customerPhone && `Tel: ${item.customerPhone}\n`}
                Rango: {item.rank}\n
                Color: {item.color}\n
                {item.location && `Ubicación: ${item.location}\n`}
                Ingreso: {new Date(item.storageDate).toLocaleDateString('es-CO')}\n
                {item.editedBy && `Editado: ${item.editedBy.username}\n`}
                {separator}\n
                DESCRIPCION Y VALOR\n
                {`Almacenaje: ${item.itemsDescription}`}\n
                {padLine('', formatCurrency(item.storagePrice))}\n
                {item.laundryItems && item.laundryItems.length > 0 && item.laundryItems.map((laundryItem, index) =>
                    <React.Fragment key={index}>
                        {`${laundryItem.quantity}x ${laundryItem.name}`}\n
                        {padLine('', formatCurrency(laundryItem.price * laundryItem.quantity))}\n
                    </React.Fragment>
                )}
                {separator}\n
                {padLine('TOTAL A PAGAR:', formatCurrency(item.totalPrice))}\n
                {item.payments && item.payments.length > 0 &&
                    <React.Fragment>
                        {separator}\n
                        Abonos Realizados:\n
                        {item.payments.map((payment, index) =>
                           `${new Date(payment.date).toLocaleDateString('es-CO')}   ${formatCurrency(payment.amount)}\n`
                        )}
                    </React.Fragment>
                }
                {separator}\n
                {padLine('Total Abonado:', formatCurrency(totalPaid))}\n
                {padLine('SALDO PENDIENTE:', formatCurrency(item.remainingBalance))}\n
                {separator}\n
                {center('¡Gracias por su preferencia!')}
            </pre>
        </div>
    );
});
ThermalReceipt.displayName = 'ThermalReceipt';


export function InvoiceDialog({ isOpen, onClose, item }: InvoiceDialogProps) {
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (printContent) {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write('<html><head><title>Factura</title>');
        doc.write(`
          <style>
            @media print {
              @page {
                size: 58mm;
                margin: 0;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100%;
                font-family: 'Courier New', monospace;
                font-size: 9pt;
                color: #000;
                background-color: #fff;
              }
              pre {
                margin: 0;
                padding: 2mm;
                white-space: pre-wrap; /* Wrap long lines */
                word-break: break-all;
              }
            }
          </style>
        `);
        doc.write('</head><body>');
        doc.write(printContent.innerHTML);
        doc.write('</body></html>');
        doc.close();

        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 500);
      }
    }
  };


  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Factura - ID: {item.id}</DialogTitle>
          <DialogDescription>
            Revisa los detalles antes de imprimir la factura.
          </DialogDescription>
        </DialogHeader>
        
        <div className="border bg-white p-2 rounded-sm overflow-auto max-h-[60vh] sm:max-h-[70vh]">
          {/* We render the receipt component here for the user to see */}
          <ThermalReceipt ref={invoiceRef} item={item} />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cerrar</Button>
          <Button type="button" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/>Imprimir Factura</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
