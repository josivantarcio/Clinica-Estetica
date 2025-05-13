import { Providers } from './providers'

export const metadata = {
  title: 'Sistema de Gestão para Clínicas de Estética',
  description: 'Sistema SaaS para gestão de clínicas de estética',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 