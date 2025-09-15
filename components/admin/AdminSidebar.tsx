// components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  Tag,
  HelpCircle,
  Shirt,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useEffect } from 'react';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral do sistema',
  },
  {
    name: 'Pedidos',
    href: '/admin/pedidos',
    icon: Package,
    description: 'Gerenciar pedidos',
  },
  {
    name: 'Produtos',
    href: '/admin/produtos',
    icon: Shirt,
    description: 'Gerenciar produtos',
  },
  {
    name: 'Clientes',
    href: '/admin/usuarios',
    icon: Users,
    description: 'Gerenciar usuários',
  },
  {
    name: 'Cupons',
    href: '/admin/cupons',
    icon: Tag,
    description: 'Gerenciar cupons',
  },
];

interface AdminSidebarProps {
  open?: boolean;
  onToggle?: () => void;
}

export default function AdminSidebar({
  open = false,
  onToggle,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // Fechar o menu ao redimensionar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && open && onToggle) {
        onToggle();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, onToggle]);

  // Fechar menu ao pressionar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && onToggle) {
        onToggle();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onToggle]);

  // Desabilitar scroll do body quando menu está aberto no mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <>
      {/* Sidebar para desktop e drawer para mobile */}
      <aside
        id="admin-sidebar"
        className={cn(
          'fixed left-0 z-40 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out',
          'md:relative md:translate-x-0 md:top-0',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
        aria-label="Menu administrativo"
      >
        {/* Cabeçalho com botão de fechar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h1 className="text-lg font-bold flex items-center gap-2">
            Painel Administrativo
          </h1>
          <button
            className="md:hidden text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white rounded-md p-1"
            onClick={onToggle}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          className="flex-1 p-4 overflow-y-auto"
          aria-label="Navegação principal"
        >
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group',
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                    )}
                    onClick={() => {
                      if (open && onToggle) {
                        onToggle();
                      }
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    title={item.description}
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isActive ? 'scale-110' : 'group-hover:scale-110',
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.name}</span>
                    {isActive && (
                      <span
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                        aria-hidden="true"
                      ></span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link
            href="/admin/ajuda"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors group"
            onClick={() => {
              if (open && onToggle) {
                onToggle();
              }
            }}
            title="Obter ajuda e suporte"
          >
            <HelpCircle
              className="h-4 w-4 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            />
            Ajuda e Suporte
          </Link>
        </div>
      </aside>

      {/* Overlay para fechar o menu no mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onToggle}
          aria-label="Fechar menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onToggle) {
              onToggle();
            }
          }}
        />
      )}
    </>
  );
}
