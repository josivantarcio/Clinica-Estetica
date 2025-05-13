import '@testing-library/jest-dom'

declare global {
  var products: any[]
  var categories: any[]
}

declare module '@testing-library/jest-dom' {
  export * from '@testing-library/jest-dom'
} 