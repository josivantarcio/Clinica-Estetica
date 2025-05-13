'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { AuthProvider } from '@/contexts/AuthContext'

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5f7ff',
      100: '#ebf0fe',
      200: '#d6e0fd',
      300: '#b3c7fc',
      400: '#8aa8fa',
      500: '#6189f8',
      600: '#386af6',
      700: '#0f4bef',
      800: '#0c3cbf',
      900: '#092d8f',
    },
  },
  fonts: {
    heading: 'var(--font-inter)',
    body: 'var(--font-inter)',
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ChakraProvider>
    </CacheProvider>
  )
} 