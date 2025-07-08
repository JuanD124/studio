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
  customerName: z.string().min(2, { message: 'El nombre del cliente debe tener al menos 2 caracteres.' }),
  rank: z.string().optional(),
  battalion: z.string().optional(),
  ticketColor: z.string().optional(),
  itemsDescription: z.string().min(5, { message: 'La descripción debe tener al menos 5 caracteres.' }),
  storagePrice: z.coerce.number().min(0, { message: 'El precio de almacenamiento debe ser un número positivo.' }).default(0),
  laundryItems: z.array(z.object({
    laundryItemId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.coerce.number().min(1, { message: "La cantidad debe ser al menos 1." })
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
      rank: '',
      battalion: '',
      ticketColor: '',
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
      rank: data.rank,
      battalion: data.battalion,
      ticketColor: data.ticketColor,
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
          <DialogTitle className="font-headline">Almacenar Nuevo Artículo</DialogTitle>
          <DialogDescription>
            Introduce los detalles y precios del artículo a almacenar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="add-item-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[65vh] overflow-y-auto pr-4">
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rango (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Soldado, Cabo..." {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="battalion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batallón (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="BCG No. 21" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="ticketColor"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Color del Ticket (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccionar color..." />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Rojo">Rojo</SelectItem>
                        <SelectItem value="Azul">Azul</SelectItem>
                        <SelectItem value="Verde">Verde</SelectItem>
                        <SelectItem value="Amarillo">Amarillo</SelectItem>
                        <SelectItem value="Naranja">Naranja</SelectItem>
                        <SelectItem value="Blanco">Blanco</SelectItem>
                    </SelectContent>
                    </Select>
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
            <FormField
                control={form.control}
                name="storagePrice"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Precio Almacenamiento (COP)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="space-y-2">
              <FormLabel>Añadir Servicio de Lavandería</FormLabel>
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <FormLabel className="text-xs text-muted-foreground">Servicio</FormLabel>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
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
                  <FormLabel className="text-xs text-muted-foreground">Cantidad</FormLabel>
                  <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      min="1"
                  />
                </div>
                <Button type="button" variant="outline" onClick={addLaundryItem}>Añadir</Button>
              </div>
            </div>

            {fields.length > 0 && (
              <div className="space-y-2 rounded-md border p-2">
                <FormLabel>Servicios añadidos</FormLabel>
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
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" form="add-item-form">Añadir Artículo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
