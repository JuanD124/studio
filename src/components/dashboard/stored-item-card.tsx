'use client';
import React from 'react';
import type { Payment, StoredItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Clock, Package, PackageCheck, Palette, Shield, User, Users, Fingerprint, MoreVertical, Pencil, Receipt, Banknote, History, Shirt, ChevronDown, ChevronUp, DollarSign, CheckCircle2, MapPin, Phone } from 'lucide-react';
import { formatCurrency, getStorageDuration } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useAuth } from '@/context/AuthContext';

interface StoredItemCardProps {
  item: StoredItem;
  onClaim: (item: StoredItem) => void;
  onOpenInvoice: (item: StoredItem) => void;
  onEdit: (item: StoredItem) => void;
  onAddPayment: (item: StoredItem) => void;
  onEditLocation: (item: StoredItem) => void;
}

const PaymentHistory = ({ payments }: { payments: Payment[] }) => (
    <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2 font-medium">
            <History className="w-3.5 h-3.5" />
            <span>Historial de Abonos</span>
        </div>
        {payments.map((p, index) => (
            <div key={index} className="flex justify-between items-center pl-4">
                <span>{format(new Date(p.date), 'dd/MM/yyyy')}</span>
                <Badge variant="outline">{formatCurrency(p.amount)}</Badge>
            </div>
        ))}
    </div>
);

const LaundryItemsList = ({ items }: { items: StoredItem['laundryItems'] }) => (
  <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2 font-medium">
          <Shirt className="w-3.5 h-3.5" />
          <span>Servicios de Lavandería</span>
      </div>
      {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center pl-4">
              <span>{item.quantity} &times; {item.name}</span>
              <Badge variant="outline">{formatCurrency(item.price * item.quantity)}</Badge>
          </div>
      ))}
  </div>
);


function StoredItemCardComponent({ item, onClaim, onOpenInvoice, onEdit, onAddPayment, onEditLocation }: StoredItemCardProps) {
  const { user } = useAuth();
  const payments = item.payments || [];
  const laundryItems = item.laundryItems || [];
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isPaid = item.remainingBalance <= 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <CardTitle className="font-headline">
                    {item.customerName}
                </CardTitle>
                 {item.phone && (
                    <CardDescription className="flex items-center gap-2 pt-1">
                        <Phone className="w-3.5 h-3.5"/>
                        <span>{item.phone}</span>
                    </CardDescription>
                )}
            </div>

            {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Editar Artículo</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditLocation(item)}>
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>Editar Ubicación</span>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
        <Badge variant="secondary" className="w-fit mt-2">ID: {item.id}</Badge>
        <CardDescription className="flex items-center gap-2 pt-2">
          <Package className="w-4 h-4" />
          <span>{item.itemsDescription}</span>
        </CardDescription>
         <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <div className="flex items-center gap-2">
                <Palette className="w-3 h-3"/><span>{item.color}</span>
            </div>
            <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>{getStorageDuration(item.storageDate)}</span>
            </div>
             <Button variant="ghost" size="sm" className="h-auto p-0 justify-start" onClick={() => onEditLocation(item)}>
                 <MapPin className="w-3 h-3 mr-2"/>
                 <span className={item.location ? '' : 'text-muted-foreground italic'}>
                   {item.location || 'Sin ubicación'}
                 </span>
             </Button>
        </div>
      </CardHeader>

      <CollapsibleContent asChild>
        <CardContent className="flex flex-col flex-grow justify-between space-y-4">
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t mt-4">
                <div className="flex items-center gap-2 pt-2">
                    <User className="w-3 h-3"/>
                    <span>{item.rank}</span>
                </div>
                {item.customerId && <div className="flex items-center gap-2"><Fingerprint className="w-3 h-3"/><span>C.C. {item.customerId}</span></div>}
                {item.battalion && <div className="flex items-center gap-2"><Shield className="w-3 h-3"/><span>{item.battalion}</span></div>}
                {item.contingent && <div className="flex items-center gap-2"><Users className="w-3 h-3"/><span>{item.contingent}</span></div>}
                {item.editedBy && (
                    <div className="flex items-center text-amber-600 italic pt-1">
                    <History className="mr-2 h-3 w-3" />
                    <span>
                        Editado por {item.editedBy.username} el {format(new Date(item.editedBy.date), 'dd/MM/yy HH:mm')}
                    </span>
                    </div>
                )}
            </div>
            
            <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Precio de Almacenamiento</span>
                </div>
                <div className="flex justify-between items-center pl-4">
                    <span>Valor base</span>
                    <Badge variant="outline">{formatCurrency(item.storagePrice)}</Badge>
                </div>
            </div>

            {laundryItems.length > 0 && <LaundryItemsList items={laundryItems} />}
            {payments.length > 0 && <PaymentHistory payments={payments} />}
        </CardContent>
      </CollapsibleContent>

      <CardContent className='pt-2'>
        <div className="space-y-2 text-sm pt-2">
          <Separator />
           <div className="flex justify-between font-semibold text-base pt-2">
            <span>Total a Pagar:</span>
            <span>{formatCurrency(item.totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Saldo Pendiente:</span>
            {isPaid ? (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    PAGADO
                </Badge>
            ) : (
                <span className="font-bold text-destructive">{formatCurrency(item.remainingBalance)}</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
          <CollapsibleTrigger asChild>
             <Button variant="ghost" className="w-full">
                {isExpanded ? <ChevronUp className="mr-2 h-4 w-4"/> : <ChevronDown className="mr-2 h-4 w-4"/>}
                {isExpanded ? 'Ver menos detalles' : 'Ver más detalles'}
             </Button>
          </CollapsibleTrigger>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => onAddPayment(item)} disabled={isPaid}>
                <Banknote className="mr-2 h-4 w-4" />
                Abonar
            </Button>
            <Button variant="secondary" className="flex-1 min-w-[120px]" onClick={() => onClaim(item)}>
                <PackageCheck className="mr-2 h-4 w-4" />
                Entregado
            </Button>
          </div>
          <Button className="flex-grow w-full" onClick={() => onOpenInvoice(item)}>
            <Receipt className="mr-2 h-4 w-4" />
            Factura
          </Button>
      </CardFooter>
    </Card>
    </Collapsible>
  );
}

export const StoredItemCard = React.memo(StoredItemCardComponent);
