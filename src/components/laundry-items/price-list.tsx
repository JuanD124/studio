'use client';

import * as React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import type { LaundryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { ItemDialog } from './item-dialog';
import { Card, CardContent } from '../ui/card';

export default function PriceList() {
  const [items, setItems] = React.useState<LaundryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<LaundryItem | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, 'laundryItems'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsData: LaundryItem[] = [];
      querySnapshot.forEach((doc) => {
        itemsData.push({ id: doc.id, ...doc.data() } as LaundryItem);
      });
      setItems(itemsData);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (item: LaundryItem | null = null) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleSaveItem = async (itemData: Omit<LaundryItem, 'id'>, id?: string) => {
    try {
        if (id) {
          const itemRef = doc(db, 'laundryItems', id);
          await updateDoc(itemRef, itemData);
        } else {
          await addDoc(collection(db, 'laundryItems'), itemData);
        }
    } catch(error) {
        console.error("Error saving item: ", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'laundryItems', id));
    } catch(error) {
        console.error("Error deleting item: ", error);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          <span>Añadir Nuevo Artículo</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio / Artículo</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteItem(item.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ItemDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveItem}
        item={editingItem}
      />
    </div>
  );
}
