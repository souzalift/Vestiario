'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Página não encontrada
        </h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Ops! A página que você procura não existe, foi removida ou está
          temporariamente indisponível.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition"
        >
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
}
