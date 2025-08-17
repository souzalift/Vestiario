'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, User, Settings, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/contexts/AuthContext';

interface UserDropdownProps {
  isScrolled?: boolean;
}

export default function UserDropdown({ isScrolled }: UserDropdownProps) {
  const { userProfile, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!userProfile) return null;

  return (
    <div className="relative">
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
          isScrolled ? 'bg-gray-100' : 'bg-white'
        } border border-gray-200 hover:bg-gray-50`}
        onClick={() => setOpen((v) => !v)}
      >
        {userProfile?.photoURL ? (
          <img
            src={userProfile.photoURL}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
        )}
        <span className="font-medium text-gray-800 text-sm">
          {userProfile?.displayName || userProfile?.email || userProfile.email}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-900">
              {userProfile?.displayName ||
                userProfile?.email ||
                userProfile.email}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {userProfile?.email || userProfile.email}
            </div>
          </div>
          <ul className="py-1">
            <li>
              <Link
                href="/perfil"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                <User className="w-4 h-4" />
                Meu Perfil
              </Link>
            </li>
            <li>
              <Link
                href="/perfil/editar"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Editar Perfil
              </Link>
            </li>
            {userProfile?.role === 'admin' && (
              <li>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              </li>
            )}
          </ul>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-100 transition-colors"
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
