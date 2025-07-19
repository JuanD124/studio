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
      const contentClone = printContent.cloneNode(true) as HTMLDivElement;
      
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
              body { 
                font-family: monospace;
                font-size: 10pt;
                line-height: 1.3;
                color: #000;
                padding: 3mm;
                box-sizing: border-box;
                height: fit-content;
              }
              .receipt { width: 100%; }
              p, .item span { margin: 0; padding: 0; }
              .center { text-align: center; }
              .header h1 { font-size: 14pt; margin: 0; }
              hr { border: none; border-top: 1px dashed black; margin: 2mm 0; }
              .item, .total { display: table; width: 100%; table-layout: fixed; }
              .item span, .total span { display: table-cell; vertical-align: top; }
              .item span:first-child, .total span:first-child { text-align: left; word-break: break-word; }
              .item span:last-child, .total span:last-child { text-align: right; white-space: nowrap; }
              .grand-total { font-weight: bold; font-size: 11pt; }
              .edit-info { text-align: center; font-style: italic; font-size: 8pt; color: #555; }
            }
          </style>
        `);
        doc.write('</head><body>');
        doc.write(contentClone.innerHTML);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Factura - ID: {item.id}</DialogTitle>
          <DialogDescription>
            Revisa los detalles antes de imprimir la factura.
          </DialogDescription>
        </DialogHeader>
        
        <div ref={invoiceRef} className="font-mono text-xs bg-white text-black p-4 rounded-sm border">
            <div className="receipt">
              <div className="header center">
                  <h1>LanzaExpress</h1>
                  <p>El mejor servicio para nuestros héroes</p>
                  <hr />
                  <p>FACTURA SIMPLIFICADA</p>
                  <p>{new Date().toLocaleString('es-CO')}</p>
              </div>
              
              <hr />

              <p><strong>ID Artículo:</strong> {item.id}</p>
              <p><strong>Cliente:</strong> {item.customerName}</p>
              <p><strong>Rango:</strong> {item.rank}</p>
              <p><strong>Fecha Ingreso:</strong> {new Date(item.storageDate).toLocaleDateString('es-CO')}</p>
              
              {item.editedBy && (
                <>
                  <hr/>
                  <p className="edit-info">Últ. Edición: {item.editedBy.username} {format(new Date(item.editedBy.date), 'dd/MM/yy HH:mm')}</p>
                </>
              )}

              <hr />

              <div className="item">
                  <span><strong>Descripción</strong></span>
                  <span><strong>Valor</strong></span>
              </div>
              
              <hr />
              
              <div className="item">
                  <span>Almacenamiento: {item.itemsDescription}</span>
                  <span>{formatCurrency(item.storagePrice)}</span>
              </div>

              {item.laundryItems && item.laundryItems.length > 0 && (
                  <>
                      <p><strong>Serv. Lavandería:</strong></p>
                      {item.laundryItems.map((laundryItem, index) => (
                          <div key={index} className="item">
                              <span>- {laundryItem.quantity}x {laundryItem.name}</span>
                              <span>{formatCurrency(laundryItem.price * laundryItem.quantity)}</span>
                          </div>
                      ))}
                  </>
              )}
              
              <hr />

              <div className="total grand-total">
                  <span>TOTAL A PAGAR:</span>
                  <span>{formatCurrency(item.totalPrice)}</span>
              </div>

              {item.payments && item.payments.length > 0 && (
                <>
                  <hr />
                  <p><strong>Pagos/Abonos:</strong></p>
                  {item.payments.map((payment, index) => (
                    <div key={index} className="item">
                        <span>- Abono ({new Date(payment.date).toLocaleDateString('es-CO')})</span>
                        <span>{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </>
              )}

              <hr />

              <div className="total">
                  <span>Total Abonado:</span>
                  <span>{formatCurrency(totalPaid)}</span>
              </div>
              <div className="total grand-total">
                  <span>SALDO PENDIENTE:</span>
                  <span>{formatCurrency(item.remainingBalance)}</span>
              </div>

              <hr />

              <p className="center">¡Gracias por su preferencia!</p>
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
