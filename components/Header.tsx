'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OV</span>
            </div>
            <span className="text-xl font-bold text-gray-900">O Vestiário</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              Início
            </Link>
            <Link href="/produtos" className="text-gray-600 hover:text-blue-600 transition-colors">
              Produtos
            </Link>
            <Link href="/sobre" className="text-gray-600 hover:text-blue-600 transition-colors">
              Sobre
            </Link>
            <Link href="/contato" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contato
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L17 18" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Início
              </Link>
              <Link href="/produtos" className="text-gray-600 hover:text-blue-600 transition-colors">
                Produtos
              </Link>
              <Link href="/sobre" className="text-gray-600 hover:text-blue-600 transition-colors">
                Sobre
              </Link>
              <Link href="/contato" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contato
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}