import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Salão Estética - Sistema de Gerenciamento',
  description: 'Sistema completo para gerenciamento de salão de beleza e clínica estética',
};

export default function RootLayout({
  children,
}: {
  children: any;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
