import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'souzalift@gmail.com',
  'admin@ovestiario.com'
];

// Para páginas (pode usar redirect)
export async function requireAdmin() {
  const user = await currentUser();

  console.log('🔐 Verificando admin no servidor:', {
    userId: user?.id,
    email: user?.primaryEmailAddress?.emailAddress,
    emailAddresses: user?.emailAddresses?.map(e => e.emailAddress)
  });

  if (!user) {
    console.log('❌ Usuário não encontrado, redirecionando para login');
    redirect('/login');
  }

  const email = user.primaryEmailAddress?.emailAddress;

  if (!email || !ADMIN_EMAILS.includes(email)) {
    console.log('❌ Email não autorizado:', email);
    redirect('/');
  }

  console.log('✅ Admin autorizado:', email);
  return { userId: user.id, email };
}

// Para APIs (retorna erro em vez de redirect)
export async function verifyAdmin() {
  const user = await currentUser();

  console.log('🔐 Verificando admin na API:', {
    userId: user?.id,
    email: user?.primaryEmailAddress?.emailAddress
  });

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const email = user.primaryEmailAddress?.emailAddress;

  if (!email || !ADMIN_EMAILS.includes(email)) {
    throw new Error('Acesso negado - não é administrador');
  }

  console.log('✅ Admin autorizado na API:', email);
  return { userId: user.id, email };
}

export function isAdmin(email?: string): boolean {
  if (!email) return false;
  const result = ADMIN_EMAILS.includes(email);
  console.log('🔍 Verificação isAdmin:', { email, result });
  return result;
}