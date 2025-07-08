'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { WashingMachine, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const EMAIL = 'elkin@lavanderia.com';
const PASSWORD = 'elkin1234';

export default function LoginPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const autoLogin = async () => {
      if (user) {
        // User is already logged in, AuthLayout will redirect.
        setIsLoading(false);
        return;
      }
      
      try {
        await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
        // On successful login, the AuthLayout's effect will trigger the redirect.
      } catch (e: any) {
        let errorMessage = 'Ocurrió un error inesperado al intentar iniciar sesión.';
        
        switch (e.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = `No se pudo iniciar sesión. Verifica que el usuario "${EMAIL}" exista en tu proyecto de Firebase y que la contraseña sea correcta.`;
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Error de red. Por favor, revisa tu conexión a internet e inténtalo de nuevo.';
                break;
            case 'auth/api-key-not-valid':
                 errorMessage = 'Error de configuración de Firebase. Revisa que la API Key en \`src/lib/firebase.ts\` sea correcta.';
                 break;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    autoLogin();
  }, [user]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <WashingMachine className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="mt-4 text-2xl font-bold font-headline">LavanderiaFacil</CardTitle>
        <CardDescription>Panel de Administración</CardDescription>
      </CardHeader>
      <CardContent className="text-center min-h-[120px] flex items-center justify-center">
        {isLoading && (
          <p className="text-muted-foreground animate-pulse">Iniciando sesión automáticamente...</p>
        )}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-4 text-left flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="font-semibold">Error de Inicio de Sesión</p>
                <p className="mt-1">{error}</p>
                <p className="mt-3 text-xs">
                    <b>Recordatorio:</b> Debes crear este usuario manually en la consola de Firebase > Authentication.
                </p>
              </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
