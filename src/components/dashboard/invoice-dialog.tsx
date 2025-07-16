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
              width: 300px;
              margin: 0 auto;
              padding: 10px;
              font-size: 14px;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 2px 0; }
            .item-line { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .item-line span:first-child { text-align: left; }
            .item-line span:last-child { text-align: right; }
            .details p { margin: 2px 0; }
            .separator { border-top: 1px dashed black; margin: 10px 0; }
            .total-section { font-size: 16px; }
            .total { display: flex; justify-content: space-between; }
            .total.grand-total { font-weight: bold; font-size: 18px; margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        `);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Factura - ID: {item.id}</DialogTitle>
          <DialogDescription>
            Revisa los detalles antes de imprimir la factura.
          </DialogDescription>
        </DialogHeader>
        
        <div ref={invoiceRef} className="py-4 font-mono text-sm">
            <div className="header">
                <h1>Lanzaexpres</h1>
                <p>Tu solución de lavandería y almacenamiento</p>
                <div className="separator"></div>
                <p><strong>FACTURA SIMPLIFICADA</strong></p>
                <p>{new Date().toLocaleString('es-CO')}</p>
            </div>
            
            <div className="details">
                <p><strong>ID Artículo:</strong> {item.id.substring(0, 8)}</p>
                <p><strong>Cliente:</strong> {item.customerName}</p>
                <p><strong>Rango:</strong> {item.rank}</p>
                <p><strong>Fecha Ingreso:</strong> {new Date(item.storageDate).toLocaleDateString('es-CO')}</p>
            </div>
            
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
