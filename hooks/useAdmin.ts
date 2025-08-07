import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

const ADMIN_EMAILS = [
  'souzalift@gmail.com',
  'admin@ovestiario.com'
];

export function useAdmin() {
  const { user, isLoaded } = useUser();

  const isAdmin = useMemo(() => {
    if (!isLoaded || !user) return false;

    const email = user.primaryEmailAddress?.emailAddress;

    console.log('🔍 Verificação admin:', {
      email,
      adminEmails: ADMIN_EMAILS,
      isAdmin: email ? ADMIN_EMAILS.includes(email) : false
    });

    return email ? ADMIN_EMAILS.includes(email) : false;
  }, [user, isLoaded]);

  return {
    isAdmin,
    isLoaded,
    user,
    email: user?.primaryEmailAddress?.emailAddress
  };
}