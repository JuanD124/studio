'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Shirt, Trash2, LogOut, Coins, Archive } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-8 h-8 text-primary"
                      >
                       <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0 0 12 2Z" />
                       <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
                       <circle cx="12" cy="12" r="3" />
                       <path d="M18 18.5a9 9 0 0 1-12 0" />
                       <path d="M6 6.5a9 9 0 0 1 12 0" />
                    </svg>
                    <h1 className="text-xl font-headline font-semibold">LanzaExpress</h1>
                </div>
                {user && <Badge variant={user.role === 'gerente' ? "destructive" : "secondary"}>{user.role}</Badge>}
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/dashboard'}
                tooltip="Facturación"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Facturación</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {user?.role === 'gerente' && (
                <>
                    <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === '/laundry-items'}
                        tooltip="Lista de Precios"
                    >
                        <Link href="/laundry-items">
                        <Shirt />
                        <span>Precios</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === '/overdue'}
                            tooltip="Inventario"
                        >
                            <Link href="/overdue">
                            <Archive />
                            <span>Inventario</span>
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
                        <Trash2 />
                        <span>Papelera</span>
                        </Link>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                </>
            )}
             {user?.role === 'empleado' && (
                <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === '/reports'}
                    tooltip="Cierre de Caja"
                >
                    <Link href="/reports">
                    <Coins />
                    <span>Cierre Caja</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
          </Button>
        </SidebarFooter>
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

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
         <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  return <MainLayoutContent>{children}</MainLayoutContent>;
}
