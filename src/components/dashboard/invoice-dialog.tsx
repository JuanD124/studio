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
              body {
                margin: 0;
                padding: 0;
                color: #000;
                background-color: #fff;
                font-family: monospace;
                font-size: 8pt;
                word-break: break-word;
              }
              .receipt-container {
                width: 56mm; 
                padding: 1mm;
                box-sizing: border-box;
              }
              p {
                margin: 0 0 2px 0;
                padding: 0;
                line-height: 1.2;
              }
              .center {
                text-align: center;
              }
              .header h1 {
                font-size: 10pt;
                margin: 0;
                font-weight: bold;
              }
              hr {
                border: none;
                border-top: 1px dashed black;
                margin: 2mm 0;
              }
              .item-line {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1px;
              }
              .item-line .description {
                flex-grow: 1;
                text-align: left;
                margin-right: 5px;
              }
              .item-line .price {
                flex-shrink: 0;
                text-align: right;
                white-space: nowrap;
              }
              .total-line {
                  font-weight: bold;
              }
              .edit-info {
                text-align: center;
                font-style: italic;
                font-size: 7pt;
                color: #555;
                margin-top: 2mm;
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
            <div ref={invoiceRef} className="receipt-container font-mono text-black text-[10pt]">
                <div className="header center">
                    <h1>LanzaExpress</h1>
                    <p>El mejor servicio para nuestros héroes</p>
                    <hr />
                    <p>FACTURA SIMPLIFICADA</p>
                    <p>{new Date().toLocaleString('es-CO')}</p>
                </div>
                
                <hr />

                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>Cliente:</strong> {item.customerName}</p>
                <p><strong>Rango:</strong> {item.rank}</p>
                <p><strong>Ingreso:</strong> {new Date(item.storageDate).toLocaleDateString('es-CO')}</p>
                
                {item.editedBy && (
                    <p className="edit-info">Editado: {item.editedBy.username} {format(new Date(item.editedBy.date), 'dd/MM/yy HH:mm')}</p>
                )}

                <hr />

                <div className="item-line">
                    <span className="description"><strong>Descripción</strong></span>
                    <span className="price"><strong>Valor</strong></span>
                </div>
                
                <hr style={{borderStyle: 'dotted'}} />
                
                <div className="item-line">
                    <span className="description">Almacenamiento: {item.itemsDescription}</span>
                    <span className="price">{formatCurrency(item.storagePrice)}</span>
                </div>

                {item.laundryItems && item.laundryItems.length > 0 && (
                    <>
                        <p style={{marginTop: '2mm'}}><strong>Lavandería:</strong></p>
                        {item.laundryItems.map((laundryItem, index) => (
                            <div key={index} className="item-line">
                                <span className="description">- {laundryItem.quantity}x {laundryItem.name}</span>
                                <span className="price">{formatCurrency(laundryItem.price * laundryItem.quantity)}</span>
                            </div>
                        ))}
                    </>
                )}
                
                <hr />

                <div className="item-line total-line">
                    <span className="description">TOTAL:</span>
                    <span className="price">{formatCurrency(item.totalPrice)}</span>
                </div>

                {item.payments && item.payments.length > 0 && (
                  <>
                    <hr />
                    <p><strong>Abonos:</strong></p>
                    {item.payments.map((payment, index) => (
                      <div key={index} className="item-line">
                          <span className='description'>- Abono ({new Date(payment.date).toLocaleDateString('es-CO')})</span>
                          <span className='price'>{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </>
                )}

                <hr />

                <div className="item-line">
                    <span className="description">Total Abonado:</span>
                    <span className="price">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="item-line total-line">
                    <span className="description">SALDO:</span>
                    <span className="price">{formatCurrency(item.remainingBalance)}</span>
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
