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
import { es } from 'date-fns/locale';

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
            @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap');
            * { box-sizing: border-box; }
            body { 
              font-family: 'Inconsolata', monospace;
              width: 210px;
              margin: 0;
              padding: 5px;
              font-size: 12px;
              line-height: 1.2;
              color: #000;
            }
            .header { text-align: center; margin-bottom: 5px; }
            .header h1 { margin: 0; font-size: 16px; font-weight: 700; }
            .header p { margin: 0; font-size: 11px; }
            .item-line { display: flex; justify-content: space-between; margin-bottom: 0; word-break: break-all; }
            .item-line span:first-child { flex-basis: 70%; flex-grow: 1; text-align: left; padding-right: 4px; }
            .item-line span:last-child { flex-basis: 30%; flex-shrink: 0; text-align: right; }
            .details p { margin: 0; }
            .separator { border-top: 1px dashed black; margin: 5px 0; }
            .total-section { font-size: 12px; }
            .total { display: flex; justify-content: space-between; }
            .total.grand-total { font-weight: bold; font-size: 14px; margin-top: 2px; }
            .footer { text-align: center; margin-top: 5px; font-size: 10px; }
            .payment-summary { margin-top: 5px; }
            .edit-info { text-align: center; font-style: italic; font-size: 10px; margin-top: 5px; color: #555; }
          </style>
        `);
        doc.write('</head><body>');
        doc.write(contentClone.innerHTML);
        doc.write('</body></html>');
        doc.close();

        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }

      // Clean up the iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
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
        
        <div ref={invoiceRef} className="py-4 font-mono text-sm">
            <div className="header">
                 <h1>LanzaExpress</h1>
                <p>El mejor servicio para nuestros héroes</p>
                <div className="separator"></div>
                <p><strong>FACTURA SIMPLIFICADA</strong></p>
                <p>{new Date().toLocaleString('es-CO')}</p>
            </div>
            
            <div className="details">
                <p><strong>ID Artículo:</strong> {item.id}</p>
                <p><strong>Cliente:</strong> {item.customerName}</p>
                <p><strong>Rango:</strong> {item.rank}</p>
                <p><strong>Fecha Ingreso:</strong> {new Date(item.storageDate).toLocaleDateString('es-CO')}</p>
            </div>
            
            {item.editedBy && (
              <div className="edit-info">
                <div className="separator"></div>
                <p>Últ. Edición: {item.editedBy.username} {format(new Date(item.editedBy.date), 'dd/MM/yy HH:mm')}</p>
              </div>
            )}

            <div className="separator"></div>

            <div className="item-line">
                <span><strong>Descripción</strong></span>
                <span><strong>Valor</strong></span>
            </div>
            <div className="separator"></div>
            
            <div className="item-line">
                <span>Almacenamiento: {item.itemsDescription}</span>
                <span>{formatCurrency(item.storagePrice)}</span>
            </div>

            {item.laundryItems && item.laundryItems.length > 0 && (
                <div className="mt-2">
                    <p><strong>Servicios de Lavandería:</strong></p>
                    {item.laundryItems.map((laundryItem, index) => (
                        <div key={index} className="item-line ml-2">
                            <span>{laundryItem.quantity}x {laundryItem.name}</span>
                            <span>{formatCurrency(laundryItem.price * laundryItem.quantity)}</span>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="separator"></div>

            <div className="total-section">
              <div className="total grand-total">
                  <span>TOTAL A PAGAR:</span>
                  <span>{formatCurrency(item.totalPrice)}</span>
              </div>
            </div>

            {item.payments && item.payments.length > 0 && (
              <div className="payment-summary">
                <div className="separator"></div>
                <div className="item-line">
                    <span><strong>Pagos/Abonos</strong></span>
                    <span><strong>Valor</strong></span>
                </div>
                <div className="separator"></div>
                {item.payments.map((payment, index) => (
                  <div key={index} className="item-line ml-2">
                      <span>Abono ({new Date(payment.date).toLocaleDateString('es-CO')})</span>
                      <span>{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
                <div className="separator"></div>
              </div>
            )}

            <div className="total-section payment-summary">
              <div className="total">
                  <span>Total Abonado:</span>
                  <span>{formatCurrency(totalPaid)}</span>
              </div>
              <div className="total grand-total">
                  <span>SALDO PENDIENTE:</span>
                  <span>{formatCurrency(item.remainingBalance)}</span>
              </div>
            </div>

            <div className="separator"></div>

            <div className="footer">
                <p>¡Gracias por su preferencia!</p>
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
