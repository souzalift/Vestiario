// components/admin/AdminHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  Sun,
  Moon,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function AdminHeader({
  onToggleSidebar,
  sidebarOpen = false,
}: AdminHeaderProps) {
  const [notifications, setNotifications] = useState(3); // Mock data
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { userProfile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check for saved theme preference or respect OS preference
    if (typeof window !== 'undefined') {
      const isDark =
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

      setDarkMode(isDark);

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getBreadcrumb = () => {
    const paths = pathname.split('/').filter((path) => path);
    if (paths.length <= 2) return null;

    return paths.slice(1).map((path, index) => {
      const href = `/${paths.slice(0, index + 2).join('/')}`;
      const isLast = index === paths.length - 2;
      const name = path.charAt(0).toUpperCase() + path.slice(1);

      return (
        <span key={path} className="flex items-center">
          {index > 0 && <span className="mx-2 text-gray-400">/</span>}
          {isLast ? (
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {name}
            </span>
          ) : (
            <Link
              href={href}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {name}
            </Link>
          )}
        </span>
      );
    });
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b transition-all duration-300',
        scrolled
          ? 'border-gray-200 dark:border-gray-700 shadow-sm'
          : 'border-transparent',
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 md:hidden"
                onClick={onToggleSidebar}
                aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <div className="hidden md:flex flex-col">
              {getBreadcrumb() && (
                <div className="flex items-center text-sm mt-1">
                  <Link
                    href="/admin/dashboard"
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Dashboard
                  </Link>
                  {getBreadcrumb()}
                </div>
              )}
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 dark:text-gray-300 relative"
                  aria-label="Notificações"
                >
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs p-0 flex items-center justify-center rounded-full w-4 h-4 min-w-3 min-h-3">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm font-medium">Novo pedido recebido</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Há 5 minutos
                    </p>
                  </div>
                  <div className="p-3 rounded-lg mt-2">
                    <p className="text-sm font-medium">Produto esgotado</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Camisa do Flamengo
                    </p>
                  </div>
                  <div className="p-3 rounded-lg mt-2 bg-yellow-50 dark:bg-yellow-900/20">
                    <p className="text-sm font-medium">Pagamento pendente</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pedido #1234
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/notificacoes" className="cursor-pointer">
                    Ver todas as notificações
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-9 px-2"
                >
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Foto do perfil"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium">
                    {userProfile?.displayName?.split(' ')[0] || 'Admin'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/perfil" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/configuracoes" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
