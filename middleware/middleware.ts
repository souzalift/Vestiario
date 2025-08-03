import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acesso à página de login
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);

      // Verificar permissões específicas
      const path = request.nextUrl.pathname;
      const userPermissions = payload.permissions as string[];

      // Verificar permissões por rota
      if (path.startsWith('/admin/usuarios') && !userPermissions.includes('manage_users')) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }

      if (path.startsWith('/admin/produtos') && !userPermissions.includes('edit_products')) {
        return NextResponse.redirect(new URL('/admin/unauthorized', request.url));
      }

    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};