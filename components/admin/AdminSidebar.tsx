'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Shirt,
  Users,
  Home,
  Tag,
  X,
} from 'lucide-react';

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Pedidos', icon: Package },
  { href: '/admin/produtos', label: 'Produtos', icon: Shirt },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/cupons', label: 'Cupons', icon: Tag },
];

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onToggle}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} 
        md:static md:translate-x-0 md:z-0`}
      >
        <div className="h-16 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Administração
            </span>
          </Link>
          <button
            className="md:hidden text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            onClick={onToggle}
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                onClick={onToggle} // fecha ao clicar em qualquer link
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={onToggle}
            >
              <Home className="w-5 h-5" />
              Voltar para a Loja
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
