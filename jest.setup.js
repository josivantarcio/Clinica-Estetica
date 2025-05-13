// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock do fetch
global.fetch = jest.fn()

// Mock do ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock do IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock do Next.js headers
jest.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => new Map(),
}))

// Mock do Response
global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body
    this.status = options.status || 200
    this.statusText = options.statusText || 'OK'
    this.headers = new Headers(options.headers)
  }

  async json() {
    return JSON.parse(this.body)
  }

  async text() {
    return this.body
  }
}

// Limpa todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks()
}) 