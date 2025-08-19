'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Users,
  Search,
  Shield,
  User,
  Mail,
  Calendar,
  Eye,
  Edit,
  Crown,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: any;
  lastLogin: any;
  phone?: string;
}

export default function AdminUsersPage() {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
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
      loadUsers();
    }
  }, [isLoaded, isAdmin, router]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, verificationFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);

      const usersData = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];

      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por role
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filtrar por verificação
    if (verificationFilter !== 'all') {
      const isVerified = verificationFilter === 'verified';
      filtered = filtered.filter((user) => user.emailVerified === isVerified);
    }

    setFilteredUsers(filtered);
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    if (
      !confirm(
        `Tem certeza que deseja ${
          newRole === 'admin'
            ? 'promover este usuário a admin'
            : 'remover privilégios de admin'
        }?`,
      )
    ) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date(),
      });

      toast.success(
        `Usuário ${
          newRole === 'admin'
            ? 'promovido a admin'
            : 'rebaixado para usuário comum'
        } com sucesso!`,
      );
      await loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      toast.error('Erro ao atualizar permissões do usuário');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';

    let date: Date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Nunca';

    let date: Date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d atrás`;
    return formatDate(timestamp);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Gerenciar Usuários
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredUsers.length} de {users.length} usuários
              </p>
            </div>

            {/* Estatísticas rápidas */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.role === 'admin').length}
                </div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {users.filter((u) => u.emailVerified).length}
                </div>
                <div className="text-sm text-gray-600">Verificados</div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtro por role */}
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filtrar por role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    <SelectItem value="admin">Apenas admins</SelectItem>
                    <SelectItem value="user">Apenas usuários</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro por verificação */}
                <Select
                  value={verificationFilter}
                  onValueChange={setVerificationFilter}
                >
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Status de verificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="verified">Verificados</SelectItem>
                    <SelectItem value="unverified">Não verificados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Lista de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">
                        Usuário
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">
                        Role
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">
                        Cadastro
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">
                        Último Login
                      </th>
                      <th className="text-right py-4 px-6 font-medium text-gray-900">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="border-t hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <Image
                                src={user.photoURL}
                                alt={user.displayName || user.email}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                {(user.displayName ||
                                  user.email)[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.displayName || 'Sem nome'}
                              </div>
                              <div className="text-sm text-gray-600">
                                ID: {user.uid.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant={
                              user.role === 'admin' ? 'default' : 'secondary'
                            }
                            className={
                              user.role === 'admin'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                : ''
                            }
                          >
                            {user.role === 'admin' ? (
                              <>
                                <Crown className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3 mr-1" />
                                Usuário
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant={
                              user.emailVerified ? 'default' : 'destructive'
                            }
                            className={
                              user.emailVerified
                                ? 'bg-green-500 hover:bg-green-600'
                                : ''
                            }
                          >
                            {user.emailVerified ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Verificado
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Não verificado
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {getTimeAgo(user.lastLogin)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toggleUserRole(user.uid, user.role || 'user')
                              }
                              className={
                                user.role === 'admin'
                                  ? 'text-red-600 hover:text-red-700'
                                  : 'text-purple-600 hover:text-purple-700'
                              }
                            >
                              {user.role === 'admin' ? (
                                <>
                                  <UserX className="w-4 h-4 mr-1" />
                                  Remover Admin
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4 mr-1" />
                                  Tornar Admin
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum usuário encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
