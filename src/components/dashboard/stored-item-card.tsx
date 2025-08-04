'use client';
import React from 'react';
import type { Payment, StoredItem, StoredItemLaundryItem } from '@/lib/types';
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
import { Clock, Package, PackageCheck, Palette, MoreVertical, Pencil, Receipt, Banknote, History, Shirt, ChevronDown, ChevronUp, DollarSign, Phone, MapPin, User, Fingerprint, Shield, Users, Edit, CheckCircle2, CreditCard, Wallet, Archive, Droplets, CircleAlert, CircleCheck } from 'lucide-react';
import { formatCurrency, getStorageDuration } from '@/lib/utils';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface StoredItemCardProps {
  item: StoredItem;
  onClaim: (item: StoredItem) => void;
  onOpenInvoice: (item: StoredItem) => void;
  onEdit: (item: StoredItem) => void;
  onAddPayment: (item: StoredItem) => void;
  onEditPayment: (item: StoredItem, payment: Payment) => void;
  onEditLocation: (item: StoredItem) => void;
  onUpdateLaundryStatus: (item: StoredItem, laundryItem: StoredItemLaundryItem, newStatus: 'pending' | 'ready') => void;
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
                    <div className='flex items-center gap-2'>
                       {p.method === 'Transferencia' ? <CreditCard className="w-3.5 h-3.5 text-blue-500"/> : <Wallet className="w-3.5 h-3.5 text-green-500"/>}
                        <div>
                            <span className='font-mono'>{formatCurrency(p.amount)}</span>
                            <span className='text-muted-foreground ml-2'>({format(new Date(p.date), 'dd/MM/yy')})</span>
                        </div>
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

const LaundryItemsList = ({ items, onUpdateStatus }: { items: StoredItemLaundryItem[]; onUpdateStatus: (item: StoredItemLaundryItem, newStatus: 'pending' | 'ready') => void }) => {
    if (!items || items.length === 0) return null;
    
    const readyItemsCount = items.filter(item => item.status === 'ready').length;
    const allItemsReady = readyItemsCount === items.length;

    return (
        <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between font-medium">
                 <div className="flex items-center gap-2">
                    <Shirt className="w-3.5 h-3.5" />
                    <span>Servicios de Lavandería</span>
                 </div>
                 <Badge variant={allItemsReady ? "default" : "secondary"} className={cn(allItemsReady && "bg-green-500 hover:bg-green-600")}>
                    Listos: {readyItemsCount} de {items.length}
                 </Badge>
            </div>
            {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center pl-4 group">
                    <div className="flex items-center gap-2">
                        {item.status === 'ready' 
                            ? <CircleCheck className="w-4 h-4 text-green-500" />
                            : <CircleAlert className="w-4 h-4 text-amber-500" />
                        }
                        <div>
                            <p>{item.quantity} &times; {item.name}</p>
                            <p className="text-muted-foreground">{item.status === 'ready' ? 'Listo' : 'Pendiente'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge variant="outline">{formatCurrency(item.price * item.quantity)}</Badge>
                        {item.status === 'pending' && (
                           <TooltipProvider>
                             <Tooltip>
                               <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onUpdateStatus(item, 'ready')}>
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    </Button>
                               </TooltipTrigger>
                               <TooltipContent>
                                 <p>Marcar como listo</p>
                               </TooltipContent>
                             </Tooltip>
                           </TooltipProvider>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

function StoredItemCardComponent({ item, onClaim, onOpenInvoice, onEdit, onAddPayment, onEditPayment, onEditLocation, onUpdateLaundryStatus }: StoredItemCardProps) {
  const { user } = useAuth();
  const payments = item.payments || [];
  const laundryItems = item.laundryItems || [];
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isPaid = item.remainingBalance <= 0;
  const serviceType = item.serviceType || 'guardado';


  const handleEditSpecificPayment = (payment: Payment) => {
    onEditPayment(item, payment);
  };
  
  const handleUpdateStatus = (laundryItem: StoredItemLaundryItem, newStatus: 'pending' | 'ready') => {
      onUpdateLaundryStatus(item, laundryItem, newStatus);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
    <Card className={cn(
        "flex flex-col transition-all hover:shadow-lg border-l-4",
        serviceType === 'lavado' ? 'border-l-blue-400' : 'border-l-amber-400'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <CardTitle className="font-headline">
                    {item.customerName}
                </CardTitle>
                 {item.customerPhone && (
                    <CardDescription className="flex items-center gap-2 pt-1">
                        <Phone className="w-3.5 h-3.5"/>
                        <span>{item.customerPhone}</span>
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

        <div className='flex items-center justify-between mt-2'>
            <Badge variant="secondary">ID: {item.id}</Badge>
            <Badge variant={serviceType === 'lavado' ? 'default' : 'outline'} className={cn(serviceType === 'lavado' && 'bg-blue-500 hover:bg-blue-600')}>
                {serviceType === 'lavado' ? <Droplets className="mr-1.5 h-3.5 w-3.5"/> : <Archive className="mr-1.5 h-3.5 w-3.5"/>}
                {serviceType === 'lavado' ? 'Lavado' : 'Guardado'}
            </Badge>
        </div>
        
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
                    <span>Precio {serviceType === 'guardado' ? 'Almacenamiento' : 'Base Lavado'}</span>
                </div>
                <div className="flex justify-between items-center pl-4">
                    <span>Valor base</span>
                    <Badge variant="outline">{formatCurrency(item.storagePrice)}</Badge>
                </div>
            </div>

            <LaundryItemsList items={laundryItems} onUpdateStatus={handleUpdateStatus} />
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
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={() => onAddPayment(item)} disabled={isPaid}>
                <Banknote className="mr-2 h-4 w-4" />
                Abonar
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => onClaim(item)}>
                <PackageCheck className="mr-2 h-4 w-4" />
                Entregado
            </Button>
            <Button className="col-span-2" onClick={() => onOpenInvoice(item)}>
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
