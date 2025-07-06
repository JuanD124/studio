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
  name: z.string().min(3, { message: 'Item name must be at least 3 characters.' }),
  price: z.coerce.number().min(0.01, { message: 'Price must be greater than 0.' }),
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
          <DialogTitle className="font-headline">{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the details for this item.' : 'Enter the details for the new service or item.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service / Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Shirt (Wash & Fold)" {...field} />
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
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="2.50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
