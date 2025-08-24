// components/auth/AuthLayout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Painel Esquerdo (Visual) */}
      <div className="relative hidden h-full flex-col bg-gray-900 p-10 text-white lg:flex">
        <Image
          src="/images/bg-auth.jpg"
          alt="Estádio de futebol à noite"
          fill
          className="absolute inset-0 object-cover opacity-60"
          priority
        />
      </div>

      {/* Painel Direito (Formulário) */}
      <div className="flex items-center justify-center py-12 bg-gray-50">
        {children}
      </div>
    </div>
  );
}
