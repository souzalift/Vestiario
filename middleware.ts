// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log('🛡️ Middleware executado para:', pathname);

  // Rotas públicas que sempre devem ser acessíveis
  const publicRoutes = [
    '/',
    '/produtos',
    '/produto',
    '/categoria',
    '/time',
    '/busca',
    '/carrinho',
    '/checkout', // ← Checkout é público (guest checkout)
    '/sobre',
    '/contato',
    '/termos',
    '/privacidade',
    '/rastreamento',
  ];

  // Rotas que exigem autenticação obrigatória
  const protectedRoutes = [
    '/perfil',
    '/pedidos',
    '/configuracoes',
    '/admin',
  ];

  // Rotas de autenticação
  const authRoutes = ['/login', '/register', '/recuperar-senha'];

  // Verificar se é rota pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log('✅ Rota pública, permitindo acesso');
    return NextResponse.next();
  }

  // Verificar se é rota de auth
  if (authRoutes.some(route => pathname.startsWith(route))) {
    console.log('🔐 Rota de autenticação, permitindo acesso');
    return NextResponse.next();
  }

  // Verificar se é rota protegida
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    console.log('🛡️ Rota protegida, verificando autenticação...');

    // Aqui você pode implementar verificação mais robusta se necessário
    // Por enquanto, vamos confiar no client-side do AuthContext
    return NextResponse.next();
  }

  // Para todas as outras rotas, permitir acesso
  console.log('🌐 Rota não categorizada, permitindo acesso');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};