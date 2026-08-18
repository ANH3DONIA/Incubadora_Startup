import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { ToastContainer } from '@/components/ui/ToastContainer';

export const metadata: Metadata = {
  title: 'Incubator QuickPitch - Plataforma de Inversión y Quick Pitches',
  description:
    'Conecta startups innovadoras con inversionistas ángeles y fondos VC a través de Quick Pitches en vivo y Marketplace seguro.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <ToastContainer />
      </body>
    </html>
  );
}
