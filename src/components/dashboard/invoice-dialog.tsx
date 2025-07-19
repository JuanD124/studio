
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
                padding: 1mm;
                color: #000;
                background-color: #fff;
                font-family: monospace;
                font-size: 8pt;
                word-break: break-word;
              }
              .receipt-container {
                width: 56mm; 
                padding: 0;
                box-sizing: border-box;
              }
              p, span, div {
                margin: 0;
                padding: 0;
                line-height: 1.4;
              }
              .center { text-align: center; }
              .header h1 {
                font-size: 10pt;
                margin: 0;
                font-weight: bold;
              }
              .separator {
                  border-top: 1px dashed black;
                  margin: 1mm 0;
              }
              .item-block {
                margin-bottom: 1mm;
              }
              .item-block .description {
                display: block;
                text-align: left;
              }
              .item-block .price {
                display: block;
                text-align: left;
                font-weight: bold;
              }
              .total-line {
                  display: flex;
                  justify-content: space-between;
                  font-weight: bold;
              }
              .edit-info {
                text-align: center;
                font-style: italic;
                font-size: 7pt;
                color: #555;
                margin-top: 1mm;
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
            <div ref={invoiceRef} className="receipt-container">
                <div className="header center">
                    <h1>LanzaExpress</h1>
                    <p>Servicio de Lavandería</p>
                    <p>{new Date().toLocaleString('es-CO')}</p>
                </div>
                
                <div className="separator"></div>

                <p><strong>ID Ticket:</strong> {item.id}</p>
                <p><strong>Cliente:</strong> {item.customerName}</p>
                <p><strong>Rango:</strong> {item.rank}</p>
                <p><strong>Ingreso:</strong> {new Date(item.storageDate).toLocaleDateString('es-CO')}</p>
                
                {item.editedBy && (
                    <p className="edit-info">Editado: {item.editedBy.username} {format(new Date(item.editedBy.date), 'dd/MM/yy HH:mm')}</p>
                )}

                <div className="separator"></div>

                <p><strong>DESCRIPCION Y VALOR</strong></p>
                <div className="separator" style={{borderStyle: 'solid'}}></div>
                
                <div className="item-block">
                    <span className="description">Almacenamiento: {item.itemsDescription}</span>
                    <span className="price">{formatCurrency(item.storagePrice)}</span>
                </div>

                {item.laundryItems && item.laundryItems.length > 0 && (
                    <>
                        {item.laundryItems.map((laundryItem, index) => (
                            <div key={index} className="item-block">
                                <span className="description">{laundryItem.quantity}x {laundryItem.name}</span>
                                <span className="price">{formatCurrency(laundryItem.price * laundryItem.quantity)}</span>
                            </div>
                        ))}
                    </>
                )}
                
                <div className="separator"></div>

                <div className="total-line">
                    <span>TOTAL A PAGAR:</span>
                    <span>{formatCurrency(item.totalPrice)}</span>
                </div>

                {item.payments && item.payments.length > 0 && (
                  <>
                    <div className="separator"></div>
                    <p><strong>Abonos Realizados:</strong></p>
                    {item.payments.map((payment, index) => (
                      <div key={index} className="item-block">
                          <span className='description'>Abono ({new Date(payment.date).toLocaleDateString('es-CO')})</span>
                          <span className='price'>{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </>
                )}

                <div className="separator"></div>
                
                <div className="total-line">
                    <span>Total Abonado:</span>
                    <span>{formatCurrency(totalPaid)}</span>
                </div>
                <div className="total-line">
                    <span>SALDO PENDIENTE:</span>
                    <span>{formatCurrency(item.remainingBalance)}</span>
                </div>

                <div className="separator"></div>

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

