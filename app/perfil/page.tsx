'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  LogOut,
  ShoppingBag,
  Heart,
  Shield,
} from 'lucide-react';

export default function ProfilePage() {
  const { userProfile, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/perfil');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'Data indisponível';
    return new Date(timestamp.toDate()).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar de Navegação */}
            <aside className="md:col-span-1 space-y-6">
              <Card className="shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-white shadow-md">
                    <AvatarImage
                      src={userProfile.photoURL || ''}
                      alt={userProfile.displayName || 'Avatar'}
                    />
                    <AvatarFallback className="text-3xl">
                      {getInitials(userProfile.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-gray-900">
                    {userProfile.displayName || 'Usuário'}
                  </h2>
                  <p className="text-sm text-gray-500">{userProfile.email}</p>
                  {userProfile.role === 'admin' && (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4 space-y-1">
                  <Link href="/perfil/pedidos">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                    >
                      <ShoppingBag className="w-5 h-5 text-gray-600" />
                      Meus Pedidos
                    </Button>
                  </Link>
                  <Link href="/perfil/favoritos">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                    >
                      <Heart className="w-5 h-5 text-gray-600" />
                      Favoritos
                    </Button>
                  </Link>
                  <Link href="/perfil/editar">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                    >
                      <Edit className="w-5 h-5 text-gray-600" />
                      Editar Perfil
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Conteúdo Principal */}
            <div className="md:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">
                        {userProfile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium text-gray-800">
                        {userProfile.phoneNumber || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Membro desde</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(userProfile.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    Endereço Principal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userProfile.address && userProfile.address.street ? (
                    <div className="space-y-1">
                      <p className="font-medium text-gray-800">
                        {userProfile.address.street},{' '}
                        {userProfile.address.number}
                      </p>
                      <p className="text-gray-600">
                        {userProfile.address.city}, {userProfile.address.state}{' '}
                        - {userProfile.address.zipCode}
                      </p>
                      <p className="text-gray-600">
                        {userProfile.address.country}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhum endereço cadastrado.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
