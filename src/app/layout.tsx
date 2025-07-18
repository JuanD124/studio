import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Lanzaexpres',
  description: 'Manage your laundry business with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z%22 /><path d=%22M12 12a5 5 0 0 1 5 5%22 /><path d=%22M12 12a5 5 0 0 0-5 5%22 /><path d=%22M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z%22 /><line x1=%2216%22 y1=%226%22 x2=%2216.01%22 y2=%226%22 /><line x1=%2219%22 y1=%228%22 x2=%2219.01%22 y2=%228%22 /></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
