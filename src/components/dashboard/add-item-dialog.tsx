'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import type { StoredItem, LaundryItem } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const formSchema = z.object({
  customerName: z.string().min(2, { message: 'Customer name must be at least 2 characters.' }),
  itemsDescription: z.string().min(5, { message: 'Description must be at least 5 characters.' }),
  storagePrice: z.coerce.number().min(0, { message: 'Storage price must be a positive number.' }).default(0),
  laundryItems: z.array(z.object({
    laundryItemId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." })
  })).optional(),
});

type AddItemFormValues = z.infer<typeof formSchema>;

interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (data: Omit<StoredItem, 'id' | 'storageDate'>) => void;
  laundryServices: LaundryItem[];
}

export function AddItemDialog({ isOpen, onClose, onAddItem, laundryServices }: AddItemDialogProps) {
  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      itemsDescription: '',
      storagePrice: 0,
      laundryItems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "laundryItems"
  });

  const [selectedService, setSelectedService] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);

  const addLaundryItem = () => {
    if (!selectedService) return;
    const service = laundryServices.find((s) => s.id === selectedService);
    if (service) {
      append({
        laundryItemId: service.id,
        name: service.name,
        price: service.price,
        quantity: quantity,
      });
      setSelectedService('');
      setQuantity(1);
    }
  };

  const onSubmit = (data: AddItemFormValues) => {
    const laundryTotal = data.laundryItems?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
    const totalPrice = Number(data.storagePrice || 0) + laundryTotal;

    const newItemPayload: Omit<StoredItem, 'id' | 'storageDate'> = {
      customerName: data.customerName,
      itemsDescription: data.itemsDescription,
      storagePrice: Number(data.storagePrice || 0),
      laundryItems: data.laundryItems || [],
      totalPrice,
    };

    onAddItem(newItemPayload);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Store New Item</DialogTitle>
          <DialogDescription>
            Enter the details and pricing for the item to be stored.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="add-item-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[65vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Item(s) Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 1 large blue suitcase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="storagePrice"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Storage Price (COP)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="space-y-2">
              <FormLabel>Add Laundry Service</FormLabel>
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <FormLabel className="text-xs text-muted-foreground">Service</FormLabel>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {laundryServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {formatCurrency(service.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <FormLabel className="text-xs text-muted-foreground">Quantity</FormLabel>
                  <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      min="1"
                  />
                </div>
                <Button type="button" variant="outline" onClick={addLaundryItem}>Add</Button>
              </div>
            </div>

            {fields.length > 0 && (
              <div className="space-y-2 rounded-md border p-2">
                <FormLabel>Added services</FormLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                    <div>
                      <p className="font-medium">{field.quantity} &times; {field.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(field.price * field.quantity)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </form>
        </Form>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="add-item-form">Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
