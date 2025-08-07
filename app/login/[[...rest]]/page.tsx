// app/login/page.tsx
'use client';

import { SignIn } from '@clerk/nextjs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Shield, Star, Users, Truck, Trophy } from 'lucide-react';

export default function LoginPage() {
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
                <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Trophy className="w-4 h-4" />
                  Área do Cliente
                </div>

                <h1 className="text-4xl lg:text-5xl font-black text-primary-900 mb-4 leading-tight">
                  Bem-vindo de volta ao
                  <span className="block text-accent-500">O Vestiário</span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed">
                  Acesse sua conta e continue explorando nossa coleção premium
                  de camisas oficiais. Sua paixão pelo futebol começa aqui!
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary-900 mb-4">
                  Vantagens da sua conta:
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-success-100 text-success-700 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-900">
                        Frete Grátis
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Em compras acima de R$ 199
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-900">
                        Ofertas Exclusivas
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Descontos especiais para membros
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-accent-100 text-accent-700 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-900">
                        Histórico de Pedidos
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Acompanhe suas compras facilmente
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-900">
                        Compra Segura
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Dados protegidos e criptografados
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6">Nossa Comunidade</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-black text-accent-400 mb-1">
                      10k+
                    </div>
                    <div className="text-sm text-primary-200">Clientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-accent-400 mb-1">
                      500+
                    </div>
                    <div className="text-sm text-primary-200">Produtos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-accent-400 mb-1">
                      50+
                    </div>
                    <div className="text-sm text-primary-200">Times</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                {/* Header do Form */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">⚽</span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900 mb-2">
                    Entre na sua conta
                  </h2>
                  <p className="text-gray-600">
                    Acesse sua conta para continuar suas compras
                  </p>
                </div>

                {/* Clerk SignIn Component */}
                <div className="clerk-signin-container">
                  <SignIn
                    fallbackRedirectUrl="/"
                    signUpFallbackRedirectUrl="/cadastro"
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
                          'bg-primary-800 hover:bg-primary-700 rounded-xl py-3 font-bold transition-colors shadow-lg hover:shadow-xl',
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
                        colorPrimary: '#1f2937',
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
                    <p className="text-gray-600 mb-4">
                      Não tem uma conta ainda?
                    </p>
                    <Link
                      href="/cadastro"
                      className="inline-flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl"
                    >
                      Criar Conta Grátis
                    </Link>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Seus dados estão seguros
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Utilizamos criptografia de ponta para proteger suas
                      informações
                    </p>
                  </div>
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
        .clerk-signin-container .cl-rootBox {
          width: 100%;
        }

        .clerk-signin-container .cl-card {
          width: 100%;
          box-shadow: none !important;
          border: none !important;
        }

        .clerk-signin-container .cl-socialButtonsContainer {
          margin-bottom: 1.5rem;
        }

        .clerk-signin-container .cl-formButtonPrimary {
          width: 100%;
          margin-top: 1rem;
        }

        .clerk-signin-container .cl-footerAction {
          margin-top: 1.5rem;
          text-align: center;
        }

        .clerk-signin-container .cl-alternativeMethodsBlockButton {
          margin-top: 0.5rem;
        }

        .clerk-signin-container .cl-headerTitle,
        .clerk-signin-container .cl-headerSubtitle {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
