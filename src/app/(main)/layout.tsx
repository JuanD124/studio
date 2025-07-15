'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Shirt, BarChart4 } from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary"><path d="M12 2a10 10 0 1 0 10 10c0-4.42-3.58-8-8-8"/><path d="M12 15a6 6 0 1 0 0-6 6 6 0 0 0 0 6Z"/><path d="M12 18a6 6 0 1 0 0-6 6 6 0 0 0 0 6Z"/><path d="M12 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/></svg>
                <h1 className="text-xl font-headline font-semibold">Lanzaexpres</h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
                tooltip="Panel de Almacenamiento"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Almacenamiento</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/laundry-items'}
                tooltip="Lista de Precios"
              >
                <Link href="/laundry-items">
                  <Shirt />
                  <span>Lista de Precios</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/reports'}
                tooltip="Reportes y Papelera"
              >
                <Link href="/reports">
                  <BarChart4 />
                  <span>Reportes y Papelera</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b md:hidden">
            <SidebarTrigger />
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
