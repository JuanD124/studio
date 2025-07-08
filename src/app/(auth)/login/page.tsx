'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { WashingMachine } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor ingresa un correo válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // La redirección ahora es manejada por el AuthLayout
    } catch (error: any) {
        let description = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                description = 'Las credenciales son incorrectas. Por favor, verifica tu correo y contraseña.';
                break;
            case 'auth/invalid-email':
                description = 'El formato del correo electrónico no es válido.';
                break;
            case 'auth/network-request-failed':
                description = 'Error de red. Por favor, revisa tu conexión a internet.';
                break;
            case 'auth/too-many-requests':
                description = 'Demasiados intentos fallidos. Por favor, intenta de nuevo más tarde.';
                break;
            case 'auth/api-key-not-valid':
                description = 'Error de configuración de Firebase. Revisa que la API Key en `src/lib/firebase.ts` sea correcta.';
                break;
        }
        toast({
            title: 'Error al iniciar sesión',
            description,
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <WashingMachine className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="mt-4 text-2xl font-bold font-headline">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a tu panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@correo.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
