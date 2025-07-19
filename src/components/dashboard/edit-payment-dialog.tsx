'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { StoredItem, Payment } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface EditPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, oldPayment: Payment, newAmount: number) => void;
  paymentInfo: { item: StoredItem; payment: Payment } | null;
}

export function EditPaymentDialog({ isOpen, onClose, onSave, paymentInfo }: EditPaymentDialogProps) {
  const { item, payment } = paymentInfo || {};
  
  // This calculates the maximum valid amount for the edited payment.
  // It's the total price minus all *other* payments.
  const maxAllowedAmount = React.useMemo(() => {
    if (!item || !payment) return 0;
    const totalPaid = item.payments?.reduce((acc, p) => acc + p.amount, 0) || 0;
    const paidWithoutThisPayment = totalPaid - payment.amount;
    return item.totalPrice - paidWithoutThisPayment;
  }, [item, payment]);

  const formSchema = z.object({
    amount: z.coerce.number()
      .min(1, { message: 'El abono debe ser mayor a cero.' })
      .max(maxAllowedAmount, { 
        message: `El monto excede el precio total del artículo. Máximo: ${formatCurrency(maxAllowedAmount)}` 
      }),
  });

  type PaymentFormValues = z.infer<typeof formSchema>;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (isOpen && payment) {
      form.reset({ amount: payment.amount });
    }
  }, [isOpen, payment, form]);

  if (!item || !payment) return null;

  const onSubmit = (data: PaymentFormValues) => {
    onSave(item.id, payment, data.amount);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Abono</DialogTitle>
          <DialogDescription>
            Modifica el monto del abono para el artículo de <strong>{item.customerName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha del Abono:</span>
                <span>{new Date(payment.date).toLocaleDateString('es-CO')}</span>
            </div>
            <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground">Saldo Actual:</span>
                <span>{formatCurrency(item.remainingBalance)}</span>
            </div>
        </div>
        <Form {...form}>
          <form id="edit-payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuevo Monto del Abono (COP)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="5000" 
                      {...field} 
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="edit-payment-form" disabled={!form.formState.isValid}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
