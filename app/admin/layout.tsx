// app/admin/layout.tsx
'use client'; // Necessário para usar hooks como o useAdmin

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // Se o carregamento terminou e o utilizador não é admin, redireciona
    if (isLoaded && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isLoaded, router]);

  // Mostra um ecrã de carregamento enquanto verifica as permissões
  if (!isLoaded || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-gray-600" />
      </div>
    );
  }

  // Se for admin, mostra o layout
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
