// components/UserDropdown.tsx
'use client';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User as UserIcon,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
  Shield,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserDropdownProps {
  isScrolled: boolean;
  user: User;
  userProfile: UserProfile | null;
}

export default function UserDropdown({
  isScrolled,
  user,
  userProfile,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
      setIsOpen(false);

      // Redirecionar para home após logout
      router.push('/');

      // Mostrar notificação de sucesso (se estiver usando toast)
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              type: 'success',
              message: 'Logout realizado com sucesso!',
            },
          }),
        );
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);

      // Mostrar notificação de erro
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              type: 'error',
              message: 'Erro ao sair da conta. Tente novamente.',
            },
          }),
        );
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 ${
          isScrolled
            ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
            : 'text-white hover:text-accent-400 hover:bg-white/10'
        }`}
        disabled={isLoggingOut}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span>
              {userProfile?.displayName?.charAt(0)?.toUpperCase() ||
                user.email?.charAt(0)?.toUpperCase() ||
                'U'}
            </span>
          )}
        </div>

        {/* Name */}
        <span className="hidden md:block text-sm font-medium max-w-24 truncate">
          {userProfile?.displayName || user.email?.split('@')[0]}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium overflow-hidden">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg">
                    {userProfile?.displayName?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {userProfile?.displayName || 'Usuário'}
                </p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                {/* Email verification status */}
                <div className="flex items-center mt-1">
                  {user.emailVerified ? (
                    <div className="flex items-center text-xs text-green-600">
                      <Shield className="w-3 h-3 mr-1" />
                      Email verificado
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-orange-600">
                      <Mail className="w-3 h-3 mr-1" />
                      Email não verificado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon className="w-4 h-4 mr-3" />
              Meu Perfil
            </Link>

            <Link
              href="/orders"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Package className="w-4 h-4 mr-3" />
              Meus Pedidos
            </Link>

            <Link
              href="/favorites"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="w-4 h-4 mr-3" />
              Favoritos
            </Link>

            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3" />
              Configurações
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 mr-3 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 mr-3" />
              )}
              {isLoggingOut ? 'Saindo...' : 'Sair da conta'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
