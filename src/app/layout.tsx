import { Inter } from 'next/font/google';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CacheProvider } from '@chakra-ui/next-js';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sistema de Gestão - Salão de Estética',
  description: 'Sistema de gestão para salões de estética',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <CacheProvider>
          <ChakraProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ChakraProvider>
        </CacheProvider>
      </body>
    </html>
  );
} 