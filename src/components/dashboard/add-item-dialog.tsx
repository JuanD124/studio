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
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  customerName: z.string().min(2, { message: 'El nombre del cliente debe tener al menos 2 caracteres.' }),
  itemsDescription: z.string().min(5, { message: 'La descripción debe tener al menos 5 caracteres.' }),
});

type AddItemFormValues = z.infer<typeof formSchema>;

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (data: Omit<StoredItem, 'id' | 'storageDate'>) => void;
}

export function AddItemDialog({ isOpen, onClose, onAddItem }: AddItemDialogProps) {
  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      itemsDescription: '',
    },
  });

  const onSubmit = (data: AddItemFormValues) => {
    onAddItem(data);
    form.reset();
    onClose();
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Almacenar Nuevo Artículo</DialogTitle>
          <DialogDescription>Introduce los detalles del artículo a almacenar.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="itemsDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del/los Artículo(s)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ej., 1 maleta grande azul" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Añadir Artículo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
