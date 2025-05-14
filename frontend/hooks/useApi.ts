import { useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Cookies from 'js-cookie'

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean
}

interface ApiError extends Error {
  status?: number
  data?: any
}

export function useApi() {
  const { signOut } = useAuth()

  const request = useCallback(async <T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const { requiresAuth = true, ...fetchOptions } = options
    const headers = new Headers(options.headers)

    // Adiciona o token de autenticação se necessário
    if (requiresAuth) {
      const token = Cookies.get('@SalaoEstetica:token')
      if (!token) {
        throw new Error('Não autorizado')
      }
      headers.set('Authorization', `Bearer ${token}`)
    }

    // Adiciona headers padrão
    headers.set('Content-Type', 'application/json')

    try {
      const response = await fetch(`/api${endpoint}`, {
        ...fetchOptions,
        headers
      })

      // Se a resposta não for ok, lança um erro
      if (!response.ok) {
        const error: ApiError = new Error('Erro na requisição')
        error.status = response.status
        error.data = await response.json().catch(() => null)
        throw error
      }

      // Se a resposta for 204 (No Content), retorna null
      if (response.status === 204) {
        return null as T
      }

      // Retorna os dados da resposta
      return response.json()
    } catch (error) {
      // Se o erro for de autenticação, faz logout
      if (error instanceof Error && 'status' in error && (error as ApiError).status === 401) {
        signOut()
      }
      throw error
    }
  }, [signOut])

  // Métodos HTTP comuns
  const get = useCallback(<T>(endpoint: string, options?: RequestOptions) => {
    return request<T>(endpoint, { ...options, method: 'GET' })
  }, [request])

  const post = useCallback(<T>(endpoint: string, data?: any, options?: RequestOptions) => {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [request])

  const put = useCallback(<T>(endpoint: string, data?: any, options?: RequestOptions) => {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }, [request])

  const del = useCallback(<T>(endpoint: string, options?: RequestOptions) => {
    return request<T>(endpoint, { ...options, method: 'DELETE' })
  }, [request])

  return {
    request,
    get,
    post,
    put,
    delete: del
  }
} 