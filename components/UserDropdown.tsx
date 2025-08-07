'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { User, Package, Heart, Settings, ChevronDown } from 'lucide-react';
import LogoutButton from './LogoutButton';
import Image from 'next/image';

interface UserDropdownProps {
  isScrolled: boolean;
}

export default function UserDropdown({ isScrolled }: UserDropdownProps) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isScrolled
            ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
            : 'text-white hover:text-accent-400 hover:bg-white/10'
        }`}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
          {user.imageUrl ? (
            <Image
              width={32}
              height={32}
              src={user.imageUrl}
              alt={user.fullName || 'Usuário'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-primary-600" />
          )}
        </div>
        <span className="hidden lg:inline font-medium text-sm">
          {user.firstName || 'Usuário'}
        </span>
        <ChevronDown className="w-4 h-4" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                {user.imageUrl ? (
                  <Image
                    width={40}
                    height={40}
                    src={user.imageUrl}
                    alt={user.fullName || 'Usuário'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-primary-900">
                  {user.fullName || user.firstName || 'Usuário'}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/perfil"
                  className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                    active ? 'bg-gray-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Meu Perfil</span>
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/pedidos"
                  className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                    active ? 'bg-gray-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Meus Pedidos</span>
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/favoritos"
                  className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                    active ? 'bg-gray-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Favoritos</span>
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/configuracoes"
                  className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                    active ? 'bg-gray-50 text-primary-700' : 'text-gray-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </Link>
              )}
            </Menu.Item>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-2">
            <Menu.Item>
              {({ active }) => (
                <div className="px-4 py-2">
                  <LogoutButton
                    variant="menu-item"
                    className={`w-full ${active ? 'bg-red-50' : ''}`}
                    showConfirmation={true}
                  />
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
