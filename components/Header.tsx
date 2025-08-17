// components/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Bell,
  Star,
  TrendingUp,
  Shirt,
  Trophy,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTeamsMenuOpen, setIsTeamsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, loading, logout, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const teamsMenuRef = useRef<HTMLDivElement>(null);

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update cart count
  useEffect(() => {
    setCartCount(getItemCount());

    // Load favorites count
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavoritesCount(favorites.length);
    } catch {
      setFavoritesCount(0);
    }
  }, [getItemCount]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartCount(getItemCount());
    };

    const handleFavoritesUpdate = () => {
      try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavoritesCount(favorites.length);
      } catch {
        setFavoritesCount(0);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [getItemCount]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        teamsMenuRef.current &&
        !teamsMenuRef.current.contains(event.target as Node)
      ) {
        setIsTeamsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Frete grátis acima de 4 produtos
              </span>
              <span className="hidden md:flex items-center gap-2">
                <Star className="w-4 h-4" />
                Produtos oficiais licenciados
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:block">
                Central de Atendimento: (11) 99999-9999
              </span>
              <Button
                variant="link"
                size="sm"
                className="text-white p-0 h-auto"
                asChild
              >
                <Link href="/rastreamento">Rastrear Pedido</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white border-b transition-all duration-300 ${
          isScrolled ? 'border-gray-300 shadow-lg' : 'border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-lg">OV</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                  O Vestiário
                </span>
                <span className="text-xs text-gray-500 -mt-1">
                  Camisas Oficiais
                </span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex flex-1 max-w-xl mx-8"
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar camisas, times, jogadores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full border-gray-200 focus:border-gray-400 rounded-xl text-gray-700 placeholder-gray-400"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4"
                >
                  Buscar
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search Mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  const searchMobile = document.getElementById('search-mobile');
                  searchMobile?.focus();
                }}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Favorites */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-700 hover:bg-gray-100 hidden sm:flex"
                asChild
              >
                <Link href="/favoritos">
                  <Heart className="h-5 w-5" />
                  {favoritesCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white min-w-5 h-5 text-xs flex items-center justify-center p-0">
                      {favoritesCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3"
                  >
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 hover:bg-gray-100"
                      asChild
                    >
                      <Link href="/login">
                        <User className="w-4 h-4 mr-2" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800 text-white hidden sm:flex"
                      asChild
                    >
                      <Link href="/register">Cadastro</Link>
                    </Button>
                  </div>
                )}

                {/* User Dropdown */}
                {isAuthenticated && isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500">Minha conta</p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/perfil"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                      <Link
                        href="/pedidos"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        Meus Pedidos
                      </Link>
                      <Link
                        href="/favoritos"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" />
                        Favoritos
                        {favoritesCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            {favoritesCount}
                          </Badge>
                        )}
                      </Link>
                      <Link
                        href="/configuracoes"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </Link>
                    </div>

                    <Separator />

                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-700 hover:bg-gray-100"
                asChild
              >
                <Link href="/carrinho">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-700 hover:bg-gray-900 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center p-0 border-2 border-white">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="hidden lg:block border-t border-gray-100"></div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white">
          <div className="flex flex-col h-full">
            {/* Mobile Search */}
            <div className="p-4 border-b border-gray-200">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="search-mobile"
                  type="text"
                  placeholder="Buscar camisas, times..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full border-gray-200 focus:border-gray-400 rounded-xl"
                />
              </form>
            </div>

            {/* Mobile Auth */}
            {!isAuthenticated && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700"
                    asChild
                  >
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                  <Button
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                    asChild
                  >
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Cadastro
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
