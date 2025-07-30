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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { RANGOS, COLORES } from '@/lib/data';

const formSchema = z.object({
  customerName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  customerId: z.string().optional(),
  customerPhone: z.string().optional(),
  rank: z.string().min(1, { message: 'Debes seleccionar un rango.' }),
  battalion: z.string().optional(),
  contingent: z.string().optional(),
  color: z.string().min(1, { message: 'Debes seleccionar un color.' }),
  itemsDescription: z.string().min(5, { message: 'La descripción debe tener al menos 5 caracteres.' }),
  storagePrice: z.coerce.number().min(0, { message: 'El precio debe ser un número positivo.' }).default(0),
  location: z.string().optional(),
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
  onSave: (data: Omit<StoredItem, 'id' | 'storageDate' | 'payments' | 'remainingBalance'>, id?: string) => void;
  itemToEdit: StoredItem | null;
  laundryServices: LaundryItem[];
  serviceType: 'guardado' | 'lavado';
}

export function AddItemDialog({ isOpen, onClose, onSave, itemToEdit, laundryServices, serviceType }: AddItemDialogProps) {
  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      customerId: '',
      customerPhone: '',
      rank: '',
      battalion: '',
      contingent: '',
      color: '',
      itemsDescription: '',
      storagePrice: 0,
      location: '',
      laundryItems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "laundryItems"
  });

  React.useEffect(() => {
    if (itemToEdit && isOpen) {
      form.reset({
        customerName: itemToEdit.customerName,
        customerId: itemToEdit.customerId || '',
        customerPhone: itemToEdit.customerPhone || '',
        rank: itemToEdit.rank,
        battalion: itemToEdit.battalion || '',
        contingent: itemToEdit.contingent || '',
        color: itemToEdit.color,
        itemsDescription: itemToEdit.itemsDescription,
        storagePrice: itemToEdit.storagePrice,
        location: itemToEdit.location || '',
        laundryItems: itemToEdit.laundryItems || [],
      });
    } else if (isOpen) {
      form.reset({
        customerName: '',
        customerId: '',
        customerPhone: '',
        rank: '',
        battalion: '',
        contingent: '',
        color: '',
        itemsDescription: '',
        storagePrice: 0,
        location: '',
        laundryItems: [],
      });
    }
  }, [itemToEdit, isOpen, form]);

  const [selectedService, setSelectedService] = React.useState('');
  const [quantity, setQuantity] = React.useState(0);

  const addLaundryItem = () => {
    if (!selectedService || quantity <= 0) return;
    const service = laundryServices.find((s) => s.id === selectedService);
    if (service) {
      append({
        laundryItemId: service.id,
        name: service.name,
        price: service.price,
        quantity: quantity,
      });
      setSelectedService('');
      setQuantity(0);
    }
  };
  
  const getDialogTitle = () => {
    if (itemToEdit) return 'Editar Artículo';
    if (serviceType === 'lavado') return 'Nuevo Servicio de Lavado';
    return 'Nuevo Artículo para Guardar';
  }

  const onSubmit = (data: AddItemFormValues) => {
    const laundryTotal = data.laundryItems?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
    const totalPrice = Number(data.storagePrice || 0) + laundryTotal;

    const itemPayload = {
      ...data,
      storagePrice: Number(data.storagePrice || 0),
      laundryItems: data.laundryItems || [],
      totalPrice,
      serviceType: itemToEdit?.serviceType || serviceType
    };
    
    onSave(itemPayload, itemToEdit?.id);
    onClose();
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {itemToEdit ? 'Modifica los detalles del artículo y guarda los cambios.' : 'Introduce los detalles del servicio.'}
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
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cédula (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="3001234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rango</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rango..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(RANGOS).map(([group, ranks]) => (
                            <SelectGroup key={group}>
                                <FormLabel className='pl-2 text-xs'>{group}</FormLabel>
                                {ranks.map(rank => <SelectItem key={rank} value={rank}>{rank}</SelectItem>)}
                            </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un color..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COLORES.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="battalion"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Batallón (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="BICOY 20" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contingent"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Contingente (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="2do del 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="itemsDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Artículo(s)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: 1 maleta azul grande" {...field} />
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
                    <FormLabel>Precio {serviceType === 'guardado' ? 'Almacenamiento' : 'Base Lavado'} (COP)</FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            
            <div className="space-y-2">
              <FormLabel>Añadir Servicio de Lavandería (Adicional)</FormLabel>
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <FormLabel className="text-xs text-muted-foreground">Servicio</FormLabel>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
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
                      type="tel"
                      pattern="[0-9]*"
                      value={quantity === 0 ? '' : quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                      placeholder="0"
                      min="0"
                  />
                </div>
                <Button type="button" variant="outline" onClick={addLaundryItem} disabled={quantity <= 0 || !selectedService}>Añadir</Button>
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
            <Button type="submit" form="add-item-form">Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
