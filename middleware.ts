// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rotas que requerem autenticação
  const protectedRoutes = ['/profile', '/orders', '/checkout'];

  // Rotas que usuários logados não devem acessar
  const authRoutes = ['/login', '/register', '/forgot-password'];

  const pathname = request.nextUrl.pathname;

  // Verificar se tem token (você pode implementar verificação mais robusta)
  const hasAuth = request.cookies.get('firebase-auth-token')?.value;

  // Redirecionar usuários não autenticados de rotas protegidas
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !hasAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirecionar usuários autenticados de páginas de auth
  if (authRoutes.some(route => pathname.startsWith(route)) && hasAuth) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};