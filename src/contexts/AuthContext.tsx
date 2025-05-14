'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'

interface User {
  id: string
  nome: string
  email: string
  cargo: string
  clinicaId?: string
}

interface AuthContextData {
  user: User | null
  isAuthenticated: boolean
  signIn: (token: string, user: User) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verifica se há um token e usuário salvos nos cookies
    const token = Cookies.get('@SalaoEstetica:token')
    const storedUser = Cookies.get('@SalaoEstetica:user')

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const signIn = async (token: string, user: User) => {
    // Salva o token e usuário nos cookies
    Cookies.set('@SalaoEstetica:token', token, {
      expires: 7, // 7 dias
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    
    Cookies.set('@SalaoEstetica:user', JSON.stringify(user), {
      expires: 7, // 7 dias
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    // Atualiza o estado
    setUser(user)
    setIsAuthenticated(true)
  }

  const signOut = () => {
    // Remove o token e usuário dos cookies
    Cookies.remove('@SalaoEstetica:token')
    Cookies.remove('@SalaoEstetica:user')

    // Limpa o estado
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
} 