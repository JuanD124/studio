
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
                size: 58mm;
                margin: 0;
              }
              *, *::before, *::after {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              html, body {
                width: 100%;
                font-family: monospace;
                font-size: 8pt;
                color: #000;
                background-color: #fff;
              }
              .receipt-container {
                padding: 2mm;
                word-break: break-word;
              }
              .center { text-align: center; }
              .header h1 {
                font-size: 10pt;
                font-weight: bold;
                margin-bottom: 2px;
              }
              .header p {
                 margin-bottom: 2px;
                 line-height: 1.2;
              }
              .separator {
                  display: block;
                  border-top: 1px dashed black;
                  margin: 4px 0;
              }
              .item-line, .total-line {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                line-height: 1.3;
              }
              .item-line .description {
                flex-grow: 1;
                margin-right: 5px;
                text-align: left;
                word-break: break-word;
              }
              .item-line .price, .total-line .price {
                flex-shrink: 0;
                text-align: right;
              }
              .total-line .label {
                font-weight: normal;
                text-align: left;
              }
              .total-line .price {
                  font-weight: bold;
              }
              strong {
                  font-weight: bold;
              }
              .edited-by {
                  font-size: 7pt;
                  font-style: italic;
                  margin-top: 1mm;
              }
              .info-line {
                  margin-bottom: 2px;
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
        
        <div className="border bg-white p-2 rounded-sm overflow-auto max-h-[60vh] sm:max-h-[70vh]">
            <div ref={invoiceRef} className="receipt-container">
                <div className="header center">
                    <h1>LanzaExpress</h1>
                    <p>Contacto: 3157276196</p>
                    <p>{new Date().toLocaleString('es-CO')}</p>
                </div>
                
                <div className="separator"></div>

                <div className="info-line"><strong>ID Ticket:</strong> {item.id}</div>
                <div className="info-line"><strong>Cliente:</strong> {item.customerName}</div>
                {item.customerPhone && <div className="info-line"><strong>Tel:</strong> {item.customerPhone}</div>}
                <div className="info-line"><strong>Rango:</strong> {item.rank}</div>
                <div className="info-line"><strong>Color:</strong> {item.color}</div>
                {item.location && <div className="info-line"><strong>Ubicación:</strong> {item.location}</div>}
                <div className="info-line"><strong>Ingreso:</strong> {new Date(item.storageDate).toLocaleDateString('es-CO')}</div>
                
                {item.editedBy && (
                    <p className="edited-by">Editado: {item.editedBy.username} {format(new Date(item.editedBy.date), 'dd/MM/yy HH:mm')}</p>
                )}

                <div className="separator"></div>

                <p><strong>DESCRIPCION Y VALOR</strong></p>
                
                <div className="item-line">
                    <span className="description">Almacenamiento: {item.itemsDescription}</span>
                    <span className="price">{formatCurrency(item.storagePrice)}</span>
                </div>

                {item.laundryItems && item.laundryItems.length > 0 && (
                    <>
                        {item.laundryItems.map((laundryItem, index) => (
                            <div key={index} className="item-line">
                                <span className="description">{laundryItem.quantity}x {laundryItem.name}</span>
                                <span className="price">{formatCurrency(laundryItem.price * laundryItem.quantity)}</span>
                            </div>
                        ))}
                    </>
                )}
                
                <div className="separator"></div>

                <div className="total-line">
                    <span className="label">TOTAL A PAGAR:</span>
                    <span className="price">{formatCurrency(item.totalPrice)}</span>
                </div>

                {item.payments && item.payments.length > 0 && (
                  <>
                    <div className="separator"></div>
                    <p><strong>Abonos Realizados:</strong></p>
                    {item.payments.map((payment, index) => (
                      <div key={index} className="item-line">
                          <span className='description'>Abono ({new Date(payment.date).toLocaleDateString('es-CO')})</span>
                          <span className='price'>{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </>
                )}

                <div className="separator"></div>
                
                <div className="total-line">
                    <span className="label">Total Abonado:</span>
                    <span className="price">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="total-line">
                    <span className="label">SALDO PENDIENTE:</span>
                    <span className="price">{formatCurrency(item.remainingBalance)}</span>
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
