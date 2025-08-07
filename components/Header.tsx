'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Search, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserDropdown from './UserDropdown';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoaded } = useUser();

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load cart count from localStorage
  useEffect(() => {
    const loadCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('carrinho') || '[]');
        const totalItems = cart.reduce(
          (sum: number, item: any) => sum + (item.quantity || 1),
          0,
        );
        setCartCount(totalItems);
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();
    window.addEventListener('storage', loadCartCount);
    return () => window.removeEventListener('storage', loadCartCount);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200'
          : 'bg-primary-800 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                isScrolled
                  ? 'bg-primary-800 text-white'
                  : 'bg-white text-primary-800'
              }`}
            >
              ⚽
            </div>
            <span
              className={`text-xl font-black tracking-tight ${
                isScrolled ? 'text-primary-800' : 'text-white'
              }`}
            >
              O Vestiário
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`font-medium transition-colors hover:${
                isScrolled ? 'text-primary-600' : 'text-accent-400'
              } ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              Início
            </Link>
            <Link
              href="/produtos"
              className={`font-medium transition-colors hover:${
                isScrolled ? 'text-primary-600' : 'text-accent-400'
              } ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              Produtos
            </Link>
            <Link
              href="/sobre"
              className={`font-medium transition-colors hover:${
                isScrolled ? 'text-primary-600' : 'text-accent-400'
              } ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              Sobre
            </Link>
            <Link
              href="/contato"
              className={`font-medium transition-colors hover:${
                isScrolled ? 'text-primary-600' : 'text-accent-400'
              } ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              Contato
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden lg:flex relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isScrolled ? 'text-gray-400' : 'text-gray-300'
                }`}
              />
              <Input
                placeholder="Buscar camisas..."
                className={`pl-10 w-64 h-9 ${
                  isScrolled
                    ? 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    : 'bg-white/10 border-white/20 text-white placeholder-gray-300'
                }`}
              />
            </div>

            {/* User Authentication */}
            {isLoaded &&
              (user ? (
                // User logged in - Show dropdown
                <div className="relative">
                  <UserDropdown isScrolled={isScrolled} />
                </div>
              ) : (
                // User not logged in - Show user icon that goes to login
                <Link href="/admin/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${
                      isScrolled
                        ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                        : 'text-white hover:text-accent-400 hover:bg-white/10'
                    }`}
                    title="Fazer login"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              ))}

            {/* Cart */}
            <Link href="/carrinho">
              <Button
                variant="ghost"
                size="sm"
                className={`relative ${
                  isScrolled
                    ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                    : 'text-white hover:text-accent-400 hover:bg-white/10'
                }`}
                title="Carrinho de compras"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className={`md:hidden ${
                isScrolled
                  ? 'text-gray-700 hover:text-primary-600'
                  : 'text-white hover:text-accent-400'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              href="/produtos"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Produtos
            </Link>
            <Link
              href="/sobre"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre
            </Link>
            <Link
              href="/contato"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </Link>

            {/* Mobile User Menu */}
            {isLoaded &&
              (user ? (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    href="/perfil"
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Meu Perfil
                  </Link>
                  <Link
                    href="/meus-pedidos"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Meus Pedidos
                  </Link>
                  <Link
                    href="/favoritos"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Favoritos
                  </Link>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    href="/admin/login"
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Fazer Login
                  </Link>
                </div>
              ))}

            {/* Mobile Search */}
            <div className="px-3 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar camisas..."
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
