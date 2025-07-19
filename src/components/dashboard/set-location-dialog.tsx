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

interface SetLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, location: string) => void;
  item: StoredItem | null;
}

const formSchema = z.object({
  location: z.string().min(1, { message: 'La ubicación es requerida.' }),
});

type LocationFormValues = z.infer<typeof formSchema>;

export function SetLocationDialog({ isOpen, onClose, onSave, item }: SetLocationDialogProps) {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
    },
  });

  React.useEffect(() => {
    if (isOpen && item) {
      form.reset({ location: item.location || '' });
    }
  }, [isOpen, item, form]);

  if (!item) return null;

  const onSubmit = (data: LocationFormValues) => {
    onSave(item.id, data.location);
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
          <DialogTitle className="font-headline">Asignar Ubicación</DialogTitle>
          <DialogDescription>
            Introduce la ubicación para el artículo de <strong>{item.customerName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="set-location-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación (Estante / Bongo)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Estante 3, Bongo A"
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
          <Button type="submit" form="set-location-form" disabled={!form.formState.isValid}>Guardar Ubicación</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
