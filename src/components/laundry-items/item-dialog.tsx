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
import type { LaundryItem } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(3, { message: 'El nombre del artículo debe tener al menos 3 caracteres.' }),
  price: z.coerce.number().min(0.01, { message: 'El precio debe ser mayor que 0.' }),
});

type ItemFormValues = z.infer<typeof formSchema>;

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<LaundryItem, 'id'>, id?: string) => void;
  item: LaundryItem | null;
}

export function ItemDialog({ isOpen, onClose, onSave, item }: ItemDialogProps) {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: 0,
    },
  });

  React.useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        price: item.price,
      });
    } else {
      form.reset({
        name: '',
        price: 0,
      });
    }
  }, [item, form, isOpen]);

  const onSubmit = (data: ItemFormValues) => {
    onSave(data, item?.id);
    onClose();
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{item ? 'Editar Artículo' : 'Añadir Nuevo Artículo'}</DialogTitle>
          <DialogDescription>
            {item ? 'Actualiza los detalles de este artículo.' : 'Introduce los detalles para el nuevo servicio o artículo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Servicio / Artículo</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., Camisa (Lavar y Doblar)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="2.50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
