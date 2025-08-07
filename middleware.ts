// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/perfil(.*)',
  '/pedidos(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/cadastro(.*)',
  '/produto/(.*)',
  '/carrinho',
  '/sobre',
  '/contato',
  '/api/products(.*)',
  '/api/checkout',
]);

export default clerkMiddleware(async (auth, req) => {
  // Remover /api/orders(.*)  da lista de rotas públicas
  // pois precisamos de autenticação para acessar pedidos do usuário

  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session?.userId) {
      const url = new URL('/login', req.url);
      return Response.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Incluir todas as rotas exceto arquivos estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Incluir sempre root
    '/',
    // Incluir rotas de API
    '/(api|trpc)(.*)'
  ],
};
