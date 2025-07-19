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
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Clock, Package, PackageCheck, Palette, MoreVertical, Pencil, Receipt, Banknote, History, Shirt, ChevronDown, ChevronUp, DollarSign, Phone, MapPin, User, Fingerprint, Shield, Users, Edit } from 'lucide-react';
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
  onEditPayment: (item: StoredItem, payment: Payment) => void;
  onSetLocation: (item: StoredItem) => void;
}

const PaymentHistory = ({ payments, onEditPayment }: { payments: Payment[], onEditPayment: (payment: Payment) => void }) => {
    const { user } = useAuth();
    if (!payments || payments.length === 0) return null;
    
    return (
        <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 font-medium">
                <History className="w-3.5 h-3.5" />
                <span>Historial de Abonos</span>
            </div>
            {payments.map((p, index) => (
                <div key={p.id || index} className="flex justify-between items-center pl-4 group">
                    <div>
                        <span className='font-mono'>{formatCurrency(p.amount)}</span>
                        <span className='text-muted-foreground ml-2'>({format(new Date(p.date), 'dd/MM/yy')})</span>
                    </div>
                    {user?.role === 'gerente' && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => onEditPayment(p)}>
                            <Edit className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
};

const LaundryItemsList = ({ items }: { items: StoredItem['laundryItems'] }) => {
    if (!items || items.length === 0) return null;

    return (
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
};

function StoredItemCardComponent({ item, onClaim, onOpenInvoice, onEdit, onAddPayment, onEditPayment, onSetLocation }: StoredItemCardProps) {
  
  const { user } = useAuth();
  const payments = item.payments || [];
  const laundryItems = item.laundryItems || [];
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleEditSpecificPayment = (payment: Payment) => {
    onEditPayment(item, payment);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
            <CardTitle className="font-headline flex-1">
                {item.customerName}
            </CardTitle>
            
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
                </DropdownMenuContent>
            </DropdownMenu>
            
        </div>
        <Badge variant="secondary" className="w-fit">ID: {item.id}</Badge>
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
            {item.location && 
                <div className="flex items-center gap-2 font-semibold text-primary">
                    <MapPin className="w-3 h-3"/><span>{item.location}</span>
                </div>
            }
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
                {item.customerPhone && <div className="flex items-center gap-2"><Phone className="w-3 h-3"/><span>{item.customerPhone}</span></div>}
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

            <LaundryItemsList items={laundryItems} />
            <PaymentHistory payments={payments} onEditPayment={handleEditSpecificPayment} />
        </CardContent>
      </CollapsibleContent>

      <CardContent className='pt-2'>
        <div className="space-y-2 text-sm pt-2">
          <Separator />
           <div className="flex justify-between font-semibold text-base pt-2">
            <span>Total a Pagar:</span>
            <span>{formatCurrency(item.totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-destructive">
            <span>Saldo Pendiente:</span>
            {item.remainingBalance <= 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-600 font-bold">PAGADO</Badge>
            ) : (
                <span className="font-bold">{formatCurrency(item.remainingBalance)}</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={() => onAddPayment(item)} disabled={item.remainingBalance <= 0}>
                <Banknote className="mr-2 h-4 w-4" />
                Abonar
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onSetLocation(item)}>
                <MapPin className="mr-2 h-4 w-4" />
                Ubicación
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => onClaim(item)}>
                <PackageCheck className="mr-2 h-4 w-4" />
                Entregado
            </Button>
            <Button className="flex-grow w-full flex-1" onClick={() => onOpenInvoice(item)}>
                <Receipt className="mr-2 h-4 w-4" />
                Factura
            </Button>
          </div>
      </CardFooter>
    </Card>
    </Collapsible>
  );
}

export const StoredItemCard = React.memo(StoredItemCardComponent);
