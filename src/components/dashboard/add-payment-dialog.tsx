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
import type { StoredItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface AddPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, amount: number) => void;
  item: StoredItem | null;
}

export function AddPaymentDialog({ isOpen, onClose, onSave, item }: AddPaymentDialogProps) {
  const remainingBalance = item?.remainingBalance ?? 0;

  const formSchema = z.object({
    amount: z.coerce.number()
      .min(1, { message: 'El abono debe ser mayor a cero.' })
      .max(remainingBalance, { message: `El abono no puede superar el saldo pendiente de ${formatCurrency(remainingBalance)}.` }),
  });

  type PaymentFormValues = z.infer<typeof formSchema>;
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
    },
    mode: 'onChange'
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({ amount: undefined });
    }
  }, [isOpen, item, form]);
  
  if (!item) return null;
  
  const onSubmit = (data: PaymentFormValues) => {
    onSave(item.id, data.amount);
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
          <DialogTitle className="font-headline">Registrar Abono</DialogTitle>
          <DialogDescription>
            Añade un pago parcial para el artículo de <strong>{item.customerName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Descripción:</span>
            <span>{item.itemsDescription}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-muted-foreground">Saldo Pendiente:</span>
            <span>{formatCurrency(item.remainingBalance)}</span>
          </div>
        </div>
        <Form {...form}>
          <form id="add-payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto a Abonar (COP)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="5000" 
                      {...field}
                      value={field.value ?? ''}
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
          <Button type="submit" form="add-payment-form" disabled={!form.formState.isValid}>Guardar Abono</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
