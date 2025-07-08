'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { WashingMachine } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const EMAIL = 'elkin@lavanderia.com';
const PASSWORD = 'elkin1234';

export default function LoginPage() {
  const { user } = useAuth();

  useEffect(() => {
    const autoLogin = async () => {
      // If a user is already logged in (from a previous session),
      // AuthLayout will handle the redirect. We don't need to do anything here.
      if (user) {
        return;
      }
      
      try {
        await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
        // On successful login, the onAuthStateChanged listener in AuthContext
        // will update the user state, and AuthLayout will handle the redirection.
      } catch (e: any) {
        // We log the error for debugging purposes but don't show it to the user.
        // The page will continue to show the "Iniciando sesión..." message,
        // which indicates that something is preventing login without showing an explicit error.
        console.error("Fallo el inicio de sesión automático. Asegúrate que el usuario exista en Firebase y que la configuración sea correcta.", e);
      }
    };

    // We only run auto-login if there isn't a user from the auth context.
    if (!user) {
        autoLogin();
    }
  }, [user]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <WashingMachine className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="mt-4 text-2xl font-bold font-headline">LavanderiaFacil</CardTitle>
        <CardDescription>Panel de Administración</CardDescription>
      </CardHeader>
      <CardContent className="text-center min-h-[120px] flex items-center justify-center">
        {/* We always show the loading message. Redirection is handled by the layout. */}
        <p className="text-muted-foreground animate-pulse">Iniciando sesión automáticamente...</p>
      </CardContent>
    </Card>
  );
}
