'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const router = useRouter();

  // Atualizar contador do carrinho
  useEffect(() => {
    const updateCartCount = () => {
      if (typeof window !== 'undefined') {
        try {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          
          // Se o cart é um array simples de itens
          if (Array.isArray(cart)) {
            // Verifica se os itens têm propriedade quantity
            const totalItems = cart.reduce((sum: number, item: any) => {
              const quantity = item.quantity || 1; // Default para 1 se não tiver quantity
              return sum + quantity;
            }, 0);
            setCartItemsCount(totalItems);
          } else {
            // Se não é array, assume 0
            setCartItemsCount(0);
          }
        } catch (error) {
          console.error('Erro ao ler carrinho:', error);
          setCartItemsCount(0);
        }
      }
    };

    // Atualizar na montagem
    updateCartCount();

    // Escutar mudanças no localStorage (entre abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        updateCartCount();
      }
    };

    // Escutar evento customizado para atualizações do carrinho
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?busca=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleCartClick = () => {
    router.push('/carrinho');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OV</span>
            </div>
            <span className="text-xl font-bold text-gray-900">O Vestiário</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              Início
            </Link>
            <Link href="/#produtos" className="text-gray-600 hover:text-secondary transition-colors">
              Produtos
            </Link>
            <Link href="/sobre" className="text-gray-600 hover:text-secondary transition-colors">
              Sobre
            </Link>
            <Link href="/contato" className="text-gray-600 hover:text-secondary transition-colors">
              Contato
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Desktop */}
            <div className="hidden md:block relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2 p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-600 hover:text-secondary transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Mobile */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-secondary transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <button 
              onClick={handleCartClick}
              className="p-2 text-gray-600 hover:text-secondary transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-secondary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                href="/#produtos" 
                className="text-gray-600 hover:text-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Produtos
              </Link>
              <Link 
                href="/sobre" 
                className="text-gray-600 hover:text-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link 
                href="/contato" 
                className="text-gray-600 hover:text-secondary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}