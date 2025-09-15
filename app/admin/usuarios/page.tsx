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
  ChevronUp,
  ChevronDown,
  Filter,
  X,
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
  phoneNumber?: string;
  cpf: string;
  birthDate: string;
}

type SortField =
  | 'displayName'
  | 'email'
  | 'role'
  | 'emailVerified'
  | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function AdminUsersPage() {
  const { isAdmin, isLoaded } = useAdmin();
  const router = useRouter();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Estatísticas
  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const verifiedCount = users.filter((u) => u.emailVerified).length;

    return { totalUsers, adminCount, verifiedCount };
  }, [users]);

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

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'displayName':
          aValue = a.displayName || '';
          bValue = b.displayName || '';
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'role':
          aValue = a.role || 'user';
          bValue = b.role || 'user';
          break;
        case 'emailVerified':
          aValue = a.emailVerified;
          bValue = b.emailVerified;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortDirection]);

  // Paginação
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return sortedUsers.slice(startIndex, startIndex + usersPerPage);
  }, [sortedUsers, currentPage, usersPerPage]);

  const toggleUserRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';

    if (
      !confirm(
        `Tem certeza que deseja ${
          newRole === 'admin' ? 'promover' : 'rebaixar'
        } ${user.displayName || user.email}?`,
      )
    )
      return;

    setUpdatingUser(user.uid);

    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });

      // Atualiza a lista localmente
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.uid === user.uid ? { ...u, role: newRole } : u,
        ),
      );

      toast.success(
        `Usuário ${
          newRole === 'admin' ? 'promovido a admin' : 'rebaixado para usuário'
        }.`,
      );
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar permissões.');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setVerificationFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || roleFilter !== 'all' || verificationFilter !== 'all';

  if (!isLoaded || loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Usuários
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredUsers.length} de {users.length} usuários
          </p>
        </div>

        {/* Estatísticas */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <p className="text-blue-800 font-medium">{userStats.totalUsers}</p>
            <p className="text-blue-600 text-sm">Total</p>
          </div>
          <div className="bg-amber-50 px-3 py-2 rounded-lg">
            <p className="text-amber-800 font-medium">{userStats.adminCount}</p>
            <p className="text-amber-600 text-sm">Administradores</p>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg">
            <p className="text-green-800 font-medium">
              {userStats.verifiedCount}
            </p>
            <p className="text-green-600 text-sm">Verificados</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Permissão" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Permissões</SelectItem>
                  <SelectItem value="admin">Apenas Admins</SelectItem>
                  <SelectItem value="user">Apenas Usuários</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={verificationFilter}
                onValueChange={(value) => {
                  setVerificationFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Verificação" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="true">Verificados</SelectItem>
                  <SelectItem value="false">Não Verificados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Indicador de filtros ativos */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: {searchTerm}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
              {roleFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Permissão: {roleFilter === 'admin' ? 'Admin' : 'Usuário'}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setRoleFilter('all')}
                  />
                </Badge>
              )}
              {verificationFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Verificação:{' '}
                  {verificationFilter === 'true'
                    ? 'Verificado'
                    : 'Não verificado'}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setVerificationFilter('all')}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer"
                    onClick={() => handleSort('displayName')}
                  >
                    <div className="flex items-center">
                      Usuário
                      {sortField === 'displayName' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      {sortField === 'email' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">
                      Permissão
                      {sortField === 'role' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer"
                    onClick={() => handleSort('emailVerified')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === 'emailVerified' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Cadastro
                      {sortField === 'createdAt' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4 ml-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-1" />
                        ))}
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user, idx) => (
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
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate max-w-[150px]">
                            {user.displayName || 'Sem nome'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 truncate max-w-[180px]">
                        {user.email}
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
                          disabled={updatingUser === user.uid}
                        >
                          {updatingUser === user.uid ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Shield className="w-4 h-4 mr-1" />
                          )}
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
                {hasActiveFilters && (
                  <Button variant="link" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {paginatedUsers.length} de {filteredUsers.length}{' '}
                resultados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Lógica para mostrar páginas próximas à atual
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-1">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
