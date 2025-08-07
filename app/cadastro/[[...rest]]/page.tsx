'use client';

import { SignUp } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  Star,
  Users,
  Truck,
  Trophy,
  Gift,
  Clock,
  Heart,
} from 'lucide-react';

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a loja
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding and Benefits */}
            <div className="space-y-8">
              {/* Welcome Section */}
              <div>
                <div className="inline-flex items-center gap-2 bg-secondary-100 text-secondary-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Gift className="w-4 h-4" />
                  Cadastro Gratuito
                </div>

                <h1 className="text-4xl lg:text-5xl font-black text-primary-900 mb-4 leading-tight">
                  Junte-se à família
                  <span className="block text-accent-500">O Vestiário</span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed">
                  Crie sua conta gratuita e tenha acesso a ofertas exclusivas,
                  frete grátis e muito mais. Seja parte da maior comunidade de
                  amantes do futebol!
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary-900 mb-4">
                  Vantagens exclusivas para membros:
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-accent-100 text-accent-700 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-900">
                        10% de Desconto
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Na sua primeira compra
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-success-100 text-success-700 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-900">
                        Frete Grátis VIP
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Em compras acima de R$ 150 (ao invés de R$ 199)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-900">
                        Acesso Antecipado
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Seja o primeiro a ver novos lançamentos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-900">
                        Entrega Expressa
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Prioridade no processamento de pedidos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-900">
                        Programa de Fidelidade
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Acumule pontos e ganhe prêmios
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Offer */}
              <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Oferta de Boas-Vindas</h3>
                    <p className="text-secondary-100">
                      Válida apenas para novos cadastros
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-3xl font-black text-accent-400 mb-1">
                    10% OFF
                  </div>
                  <div className="text-sm">
                    + Frete Grátis na primeira compra
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                  <div>
                    <h3 className="font-bold text-primary-900">
                      Mais de 10.000 clientes satisfeitos
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Se juntaram à nossa comunidade este ano
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    +9.995 outros torcedores
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                {/* Header do Form */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">⚽</span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900 mb-2">
                    Crie sua conta
                  </h2>
                  <p className="text-gray-600">
                    É rápido, fácil e totalmente gratuito
                  </p>
                </div>

                {/* Clerk SignUp Component - CORRIGIDO */}
                <div className="clerk-signup-container">
                  <SignUp
                    appearance={{
                      elements: {
                        rootBox: 'mx-auto',
                        card: 'shadow-none border-0 bg-transparent',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        socialButtonsContainer: 'gap-3',
                        socialButtonsBlockButton:
                          'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-medium py-3 rounded-xl transition-colors',
                        socialButtonsBlockButtonText: 'text-sm font-medium',
                        dividerLine: 'bg-gray-200',
                        dividerText: 'text-gray-500 text-sm',
                        formFieldLabel: 'text-primary-900 font-medium mb-2',
                        formFieldInput:
                          'border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all',
                        formButtonPrimary:
                          'bg-secondary-500 hover:bg-secondary-600 rounded-xl py-3 font-bold transition-colors shadow-lg hover:shadow-xl',
                        footerActionLink:
                          'text-primary-600 hover:text-primary-800 font-medium',
                        identityPreviewText: 'text-gray-600',
                        identityPreviewEditButton:
                          'text-primary-600 hover:text-primary-800',
                        alternativeMethodsBlockButton:
                          'border border-gray-200 hover:bg-gray-50 rounded-xl py-3 transition-colors',
                        formFieldInputShowPasswordButton:
                          'text-primary-600 hover:text-primary-800',
                      },
                      variables: {
                        colorPrimary: '#ef4444',
                        colorBackground: '#ffffff',
                        colorInputBackground: '#f9fafb',
                        colorInputText: '#1f2937',
                        borderRadius: '12px',
                        fontFamily: 'inherit',
                      },
                    }}
                  />
                </div>

                {/* Additional Actions */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Já tem uma conta?</p>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 bg-primary-800 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl"
                    >
                      Fazer Login
                    </Link>
                  </div>
                </div>
              </div>

              {/* Terms and Privacy */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Seus dados estão protegidos
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Ao se cadastrar, você concorda com nossos{' '}
                      <Link href="/termos" className="underline font-medium">
                        Termos de Uso
                      </Link>{' '}
                      e{' '}
                      <Link
                        href="/privacidade"
                        className="underline font-medium"
                      >
                        Política de Privacidade
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Guarantee */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-accent-500" />
                  <span>Satisfação garantida ou seu dinheiro de volta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Custom Styles for Clerk */}
      <style jsx global>{`
        .clerk-signup-container .cl-rootBox {
          width: 100%;
        }

        .clerk-signup-container .cl-card {
          width: 100%;
          box-shadow: none !important;
          border: none !important;
        }

        .clerk-signup-container .cl-socialButtonsContainer {
          margin-bottom: 1.5rem;
        }

        .clerk-signup-container .cl-formButtonPrimary {
          width: 100%;
          margin-top: 1rem;
        }

        .clerk-signup-container .cl-footerAction {
          margin-top: 1.5rem;
          text-align: center;
        }

        .clerk-signup-container .cl-alternativeMethodsBlockButton {
          margin-top: 0.5rem;
        }

        .clerk-signup-container .cl-headerTitle,
        .clerk-signup-container .cl-headerSubtitle {
          display: none !important;
        }

        .clerk-signup-container .cl-formFieldAction {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
