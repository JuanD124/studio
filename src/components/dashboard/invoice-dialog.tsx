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
            .header h1 { margin: 0; font-size: 24px; display: flex; align-items: center; justify-content: center; gap: 8px;}
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
            .payment-summary { margin-top: 10px; }
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
                 <h1>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-8 h-8"><path d="M12 2a10 10 0 1 0 10 10c0-4.42-3.58-8-8-8"></path><path d="M12 15a6 6 0 1 0 0-6 6 6 0 0 0 0 6Z"></path><path d="M12 18a6 6 0 1 0 0-6 6 6 0 0 0 0 6Z"></path><path d="M12 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"></path></svg>
                    <span>Lanzaexpres</span>
                </h1>
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
