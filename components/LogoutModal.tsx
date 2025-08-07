'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { LogOut, User, AlertTriangle, X } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function LogoutModal({
  isOpen,
  onClose,
  redirectTo = '/',
}: LogoutModalProps) {
  const { logout, isLoggingOut, user } = useLogout();

  const handleLogout = async () => {
    await logout(redirectTo);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                      <LogOut className="w-6 h-6" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-bold text-primary-900">
                        Confirmar Logout
                      </Dialog.Title>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* User Info */}
                {user && (
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                        {user.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt={user.fullName || 'Usuário'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-primary-900">
                          {user.fullName || user.firstName || 'Usuário'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Atenção
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        Você será desconectado de todos os dispositivos e
                        precisará fazer login novamente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isLoggingOut}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saindo...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        Sair
                      </>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
