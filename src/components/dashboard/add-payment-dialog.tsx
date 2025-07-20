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
import type { Payment, StoredItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface AddPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: StoredItem, amount: number, method: Payment['method']) => void;
  item: StoredItem | null;
}

const paymentFormSchemaBase = z.object({
  amount: z.coerce.number()
    .min(1, { message: 'El abono debe ser mayor a cero.' }),
  method: z.enum(['Efectivo', 'Transferencia'], {
    required_error: 'Debes seleccionar un método de pago.',
  }),
});


export function AddPaymentDialog({ isOpen, onClose, onSave, item }: AddPaymentDialogProps) {
  
  const remainingBalance = item?.remainingBalance ?? 0;
  
  const formSchema = paymentFormSchemaBase.extend({
      amount: z.coerce.number()
      .min(1, { message: 'El abono debe ser mayor a cero.' })
      .max(remainingBalance, { message: `El abono no puede superar el saldo pendiente de ${formatCurrency(remainingBalance)}.` }),
  })

  type PaymentFormValues = z.infer<typeof formSchema>;
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      method: 'Efectivo',
    },
    mode: 'onChange'
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({ amount: undefined, method: 'Efectivo' });
    }
  }, [isOpen, item, form]);
  
  if (!item) return null;
  
  const onSubmit = (data: PaymentFormValues) => {
    onSave(item, data.amount, data.method);
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
                      onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                      value={field.value ?? ''}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Método de Pago</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Efectivo" />
                        </FormControl>
                        <FormLabel className="font-normal">Efectivo</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Transferencia" />
                        </FormControl>
                        <FormLabel className="font-normal">Transferencia</FormLabel>
                      </FormItem>
                    </RadioGroup>
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