// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/produto(.*)',
  '/carrinho',
  '/pagamento',
  '/api/products(.*)',
  '/api/webhooks(.*)',
  '/api/checkout',
  '/login(.*)',
  '/cadastro(.*)',
  '/pedido/sucesso',
  '/pedido/erro',
  '/pedido/pendente'
  // Remover /admin/debug - agora que funciona, proteger todas as rotas admin
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']); // Isso já inclui /admin e /admin/debug
const isAdminApi = createRouteMatcher(['/api/admin(.*)']);

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'souzalift@gmail.com',
  'admin@ovestiario.com'
];

export default clerkMiddleware(async (auth, req) => {
  // Debug para rotas admin
  if (isAdminRoute(req) || isAdminApi(req)) {
    console.log('🔐 Tentativa de acesso admin:', req.url);

    const { userId, getToken } = await auth();

    if (!userId) {
      console.log('❌ Usuário não logado, redirecionando para login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    console.log('👤 UserId encontrado:', userId);

    try {
      // Obter token JWT para acessar dados do usuário
      const token = await getToken();

      if (!token) {
        console.log('❌ Token não encontrado');
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // Buscar dados do usuário via API do Clerk
      const userResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userResponse.ok) {
        console.log('❌ Erro ao buscar dados do usuário:', userResponse.status);
        return NextResponse.redirect(new URL('/', req.url));
      }

      const userData = await userResponse.json();
      const email = userData.email_addresses?.[0]?.email_address;

      console.log('📧 Email encontrado via API:', email);
      console.log('✅ Admin emails permitidos:', ADMIN_EMAILS);
      console.log('🔍 Email está na lista?', email ? ADMIN_EMAILS.includes(email) : false);

      if (!email || !ADMIN_EMAILS.includes(email)) {
        console.log('❌ Acesso negado, redirecionando para home');
        return NextResponse.redirect(new URL('/', req.url));
      }

      console.log('✅ Acesso admin autorizado via API');

    } catch (error) {
      console.error('❌ Erro ao verificar admin:', error);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Proteger outras rotas privadas
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
