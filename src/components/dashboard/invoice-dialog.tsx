
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
                margin: 0;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 8pt;
                color: #000;
                width: 100%;
              }
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
                margin: 0;
                padding: 0;
                line-height: 1.2;
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

  const totalPaid = item.payments.reduce((sum, p) => sum + p.amount, 0);

  const generateInvoiceText = () => {
    let text = '';
    text += 'LanzaExpress\n';
    text += 'Servicio de Lavanderia\n';
    text += `Fecha: ${new Date().toLocaleString('es-CO')}\n`;
    text += 'UBICACION: Batallon de servicios N20\n';
    text += 'CONTACTO: 3157276196\n';
    text += '--------------------------------\n';
    text += `ID Ticket: ${item.id}\n`;
    text += `Cliente: ${item.customerName}\n`;
    text += `Rango: ${item.rank}\n`;
    text += `Color: ${item.color}\n`;
    text += `Ingreso: ${new Date(item.storageDate).toLocaleDateString('es-CO')}\n`;

    if (item.editedBy) {
      text += `Editado: ${item.editedBy.username} ${format(new Date(item.editedBy.date), 'dd/MM/yy HH:mm')}\n`;
    }

    text += '--------------------------------\n';
    text += 'DESCRIPCION Y VALOR\n';
    text += '================================\n\n';

    text += 'Almacenamiento:\n';
    text += `${item.itemsDescription}\n`;
    text += `${formatCurrency(item.storagePrice)}\n\n`;

    if (item.laundryItems && item.laundryItems.length > 0) {
      item.laundryItems.forEach(laundryItem => {
        text += `${laundryItem.quantity}x ${laundryItem.name}\n`;
        text += `${formatCurrency(laundryItem.price * laundryItem.quantity)}\n\n`;
      });
    }

    text += '--------------------------------\n';
    text += 'TOTAL A PAGAR:\n';
    text += `${formatCurrency(item.totalPrice)}\n\n`;

    if (item.payments && item.payments.length > 0) {
      text += 'Abonos Realizados:\n';
      item.payments.forEach(payment => {
        text += `Abono (${new Date(payment.date).toLocaleDateString('es-CO')}):\n`;
        text += `${formatCurrency(payment.amount)}\n`;
      });
      text += '\n';
    }

    text += 'Total Abonado:\n';
    text += `${formatCurrency(totalPaid)}\n\n`;

    text += 'SALDO PENDIENTE:\n';
    text += `${formatCurrency(item.remainingBalance)}\n\n`;

    text += '--------------------------------\n';
    text += '¡Gracias por su preferencia!\n';

    return text;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Factura - ID: {item.id}</DialogTitle>
          <DialogDescription>
            Revisa los detalles antes de imprimir la factura.
          </DialogDescription>
        </DialogHeader>
        
        <div className="border bg-white p-2 rounded-sm overflow-auto max-h-[50vh]">
            <div ref={invoiceRef}>
              <pre>{generateInvoiceText()}</pre>
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
