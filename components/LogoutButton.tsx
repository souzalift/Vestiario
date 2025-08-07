'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';
import LogoutModal from './LogoutModal';

interface LogoutButtonProps {
  variant?: 'button' | 'menu-item' | 'icon';
  redirectTo?: string;
  className?: string;
  showConfirmation?: boolean;
}

export default function LogoutButton({
  variant = 'button',
  redirectTo = '/',
  className = '',
  showConfirmation = true,
}: LogoutButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { logout, isLoggingOut } = useLogout();

  const handleClick = async () => {
    if (showConfirmation) {
      setShowModal(true);
    } else {
      await logout(redirectTo);
    }
  };

  // Variantes do botão
  const getVariantClasses = () => {
    switch (variant) {
      case 'button':
        return `inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 ${className}`;
      case 'menu-item':
        return `flex items-center gap-3 w-full p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700 ${className}`;
      case 'icon':
        return `p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ${className}`;
      default:
        return className;
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoggingOut}
        className={getVariantClasses()}
      >
        <LogOut className="w-4 h-4" />
        {variant !== 'icon' && (
          <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
        )}
        {isLoggingOut && variant !== 'icon' && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2" />
        )}
      </button>

      {showConfirmation && (
        <LogoutModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          redirectTo={redirectTo}
        />
      )}
    </>
  );
}
