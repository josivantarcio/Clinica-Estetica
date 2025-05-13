'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider'

interface User {
  id: string
  email: string
  clinicaId: string
  nome: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: {
    nome: string
    email: string
    documento: string
    plano: 'basico' | 'premium'
    password: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const client = new CognitoIdentityProviderClient({
        region: process.env.NEXT_PUBLIC_AWS_REGION,
      })

      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      })

      const response = await client.send(command)

      if (response.AuthenticationResult) {
        // TODO: Decode JWT and get user info
        const userData: User = {
          id: 'temp-id',
          email,
          clinicaId: 'temp-clinica-id',
          nome: 'Temp Name',
        }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const register = async (data: {
    nome: string
    email: string
    documento: string
    plano: 'basico' | 'premium'
    password: string
  }) => {
    try {
      // TODO: Implement registration with AWS Cognito and create clinic
      console.log('Registration data:', data)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 