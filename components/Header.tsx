'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Hooks e Contextos
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useClickOutside } from '@/hooks/useClickOutside';

// UI e Ícones
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  User,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // SOLUÇÃO: Estado para controlar a montagem do componente no cliente
  const [hasMounted, setHasMounted] = useState(false);

  const { userProfile, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();

  const router = useRouter();

  const userMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(userMenuRef, () => setIsUserMenuOpen(false));

  // SOLUÇÃO: Efeito que roda apenas uma vez no cliente, após a montagem
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}#produtos`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Frete grátis acima de 4 produtos
            </span>
            <span className="hidden md:flex items-center gap-2">
              <Star className="w-4 h-4" />
              Qualidade 1ª linha
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block">
              Atendimento: (71) 99999-9999
            </span>
            <Button
              variant="link"
              size="sm"
              className="text-white p-0 h-auto"
              asChild
            >
              <Link href="/rastreio">Rastrear Pedido</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b transition-all duration-300 ${
          isScrolled ? 'border-gray-200 shadow-sm' : 'border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white font-bold text-lg">OV</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">
                  O Vestiário
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  Paixão em forma de camisa
                </span>
              </div>
            </Link>

            <form
              onSubmit={handleSearch}
              className="hidden lg:flex flex-1 max-w-xl mx-8"
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar camisas, times, jogadores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-28 py-3 h-12 w-full border-gray-300 focus:border-gray-900 rounded-xl"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="text-white absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-gray-700 rounded-lg px-4 h-9"
                >
                  Buscar
                </Button>
              </div>
            </form>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-700"
                onClick={() => setIsMenuOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-gray-700 px-2 h-10"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {userProfile?.displayName?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    asChild
                    className="hidden sm:flex h-10"
                  >
                    <Link href="/login">Entrar</Link>
                  </Button>
                )}

                {isAuthenticated && isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userProfile?.displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userProfile?.email}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/perfil"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" /> Meu Perfil
                      </Link>
                      <Link
                        href="/perfil/pedidos"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4" /> Meus Pedidos
                      </Link>
                      <Link
                        href="/favoritos"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" /> Favoritos{' '}
                        <Badge variant="secondary" className="ml-auto">
                          {favoritesCount}
                        </Badge>
                      </Link>
                    </div>
                    <Separator />
                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" /> Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block mx-1"
              />

              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-700 hidden sm:flex"
                asChild
              >
                <Link href="/favoritos">
                  <Heart className="h-5 w-5" />
                  {hasMounted && favoritesCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white size-5 text-xs p-0 flex items-center justify-center">
                      {favoritesCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-700"
                asChild
              >
                <Link href="/carrinho">
                  <ShoppingCart className="h-5 w-5" />
                  {hasMounted && cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white size-5 text-xs p-0 flex items-center justify-center">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-700"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="relative flex flex-col h-full w-4/5 max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Adicione seus links de navegação mobile aqui */}
            </div>
            {!isAuthenticated && (
              <div className="p-4 border-t grid grid-cols-2 gap-3">
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    Cadastro
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
