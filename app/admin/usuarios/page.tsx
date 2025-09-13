'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Firebase e Serviços
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// UI e Ícones
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  Shield,
  User,
  Crown,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export default function AdminUsersPage() {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  useEffect(() => {
    if (isLoaded) {
      if (!isAdmin) {
        router.push('/');
        return;
      }

      const fetchUsers = async () => {
        try {
          const res = await fetch('/api/users');
          const data = await res.json();
          setUsers(
            data.map((u: any) => ({
              ...u,
              createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
              lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : undefined,
            })),
          );
          setLoading(false);
        } catch (err) {
          console.error(err);
          toast.error('Não foi possível carregar os usuários.');
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [isLoaded, isAdmin, router]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch = searchTerm
        ? user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      const roleMatch = roleFilter !== 'all' ? user.role === roleFilter : true;

      const verificationMatch =
        verificationFilter !== 'all'
          ? String(user.emailVerified) === verificationFilter
          : true;

      return searchMatch && roleMatch && verificationMatch;
    });
  }, [users, searchTerm, roleFilter, verificationFilter]);

  const toggleUserRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (
      !confirm(
        `Tem certeza que deseja ${
          newRole === 'admin' ? 'promover' : 'rebaixar'
        } ${user.displayName}?`,
      )
    )
      return;

    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
      toast.success(
        `Usuário ${
          newRole === 'admin' ? 'promovido a admin' : 'rebaixado para usuário'
        }.`,
      );
    } catch (error) {
      toast.error('Erro ao atualizar permissões.');
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Usuários
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredUsers.length} de {users.length} usuários
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filtrar por permissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Permissões</SelectItem>
                <SelectItem value="admin">Apenas Admins</SelectItem>
                <SelectItem value="user">Apenas Usuários</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={verificationFilter}
              onValueChange={setVerificationFilter}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Status de verificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="true">Verificados</SelectItem>
                <SelectItem value="false">Não Verificados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Usuário
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Permissão
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Cadastro
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.uid}
                    className={`hover:bg-gray-50 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Image
                          width={40}
                          height={40}
                          src={
                            user.photoURL ||
                            `https://ui-avatars.com/api/?name=${
                              user.displayName || user.email
                            }&background=random`
                          }
                          alt={user.displayName || user.email}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.displayName || 'Sem nome'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          user.role === 'admin' ? 'default' : 'secondary'
                        }
                        className={
                          user.role === 'admin'
                            ? 'bg-amber-400 hover:bg-amber-500'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }
                      >
                        {user.role === 'admin' ? (
                          <Crown className="w-3 h-3 mr-1 text-black" />
                        ) : (
                          <User className="w-3 h-3 mr-1 text-white" />
                        )}
                        {user.role === 'admin' ? 'ADM' : 'Cliente'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={user.emailVerified ? 'default' : 'destructive'}
                        className={
                          user.emailVerified
                            ? 'bg-green-600 hover:bg-green-700'
                            : ''
                        }
                      >
                        {user.emailVerified ? (
                          <UserCheck className="w-3 h-3 mr-1" />
                        ) : (
                          <UserX className="w-3 h-3 mr-1" />
                        )}
                        {user.emailVerified ? 'Verificado' : 'Não Verificado'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserRole(user)}
                        >
                          <Shield className="w-4 h-4 mr-1" />
                          {user.role === 'admin' ? 'Rebaixar' : 'Promover'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
