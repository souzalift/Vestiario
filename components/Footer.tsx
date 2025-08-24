// components/Footer.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SiX, SiInstagram, SiWhatsapp } from '@icons-pack/react-simple-icons';

import { Coffee } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Coluna 1: Logo e Descrição */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/logo.png"
                  alt="O Vestiário Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-white">O Vestiário</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              A sua paixão pelo futebol vestida com a melhor qualidade. Camisas
              importadas dos maiores clubes do mundo.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SiInstagram color="#FF0069" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SiX />
              </a>
              <a
                href="#"
                aria-label="Whatsapp"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SiWhatsapp color="#25D366" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Links Institucionais */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Institucional
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/sobre"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="/atendimento"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Atendimento
                </Link>
              </li>
              <li>
                <Link
                  href="/garantia"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Garantia
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Links de Ajuda */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Ajuda
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Central de Ajuda (FAQ)
                </Link>
              </li>
              <li>
                <Link
                  href="/trocas"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link
                  href="/envio"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Política de Envio
                </Link>
              </li>
              <li>
                <Link
                  href="/rastreio"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Rastrear Pedido
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barra Inferior */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} O Vestiário. Todos os direitos
            reservados.
          </p>

          <p className="mt-4 sm:mt-0">
            Um projeto de{' '}
            <a
              href="https://github.com/souzalift"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors underline"
            >
              Igor Machado
              <Coffee className="inline w-4 h-4 mb-0.5" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
