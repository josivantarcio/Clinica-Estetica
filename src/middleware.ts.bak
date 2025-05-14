import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/recuperar-senha', '/cadastro'];

// Rotas que começam com /api/auth são públicas
const isAuthApiRoute = (pathname: string) => pathname.startsWith('/api/auth');

// Verifica se a rota é pública
const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route => pathname === route) || isAuthApiRoute(pathname);
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica se é uma rota pública
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Verifica se o usuário está autenticado
  const token = request.cookies.get('@SalaoEstetica:token');

  // Se não estiver autenticado e tentar acessar uma rota protegida, redireciona para o login
  if (!token && !isPublicRoute(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se estiver autenticado e tentar acessar o login, redireciona para o dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configura quais rotas o middleware deve interceptar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 