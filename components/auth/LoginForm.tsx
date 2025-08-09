'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Chrome, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onEmailPasswordLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  loading: boolean;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };
  onErrorsChange: (errors: {
    email?: string;
    password?: string;
    general?: string;
  }) => void;
}

export default function LoginForm({
  onEmailPasswordLogin,
  onGoogleLogin,
  loading,
  errors,
  onErrorsChange,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Limpar erros quando usuário digitar
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email || errors.general) {
      onErrorsChange({
        ...errors,
        email: undefined,
        general: undefined,
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password || errors.general) {
      onErrorsChange({
        ...errors,
        password: undefined,
        general: undefined,
      });
    }
  };

  // Validação de campos
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    onErrorsChange({ ...errors, ...newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onErrorsChange({});

    // Validar formulário
    if (!validateForm()) {
      return;
    }

    await onEmailPasswordLogin(email.trim().toLowerCase(), password);
  };

  // Função para preencher dados de teste (remover em produção)
  const fillTestData = () => {
    setEmail('teste@exemplo.com');
    setPassword('123456');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header do formulário */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">⚽</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo de volta!
        </h1>
        <p className="text-gray-600">
          Entre na sua conta e continue explorando as melhores camisas de
          futebol
        </p>
      </div>

      {/* Erro geral */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Erro no login
              </h3>
              <p className="text-sm text-red-700 mt-1">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Card do formulário */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className={`block w-full px-4 py-4 pl-12 text-gray-900 border rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-green-500'
                  }`}
                  placeholder="seu@email.com"
                />
                <Mail
                  className={`absolute left-4 top-4 h-5 w-5 ${
                    errors.email ? 'text-red-400' : 'text-gray-400'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={`block w-full px-4 py-4 pl-12 pr-12 text-gray-900 border rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-green-500'
                  }`}
                  placeholder="Sua senha"
                />
                <Lock
                  className={`absolute left-4 top-4 h-5 w-5 ${
                    errors.password ? 'text-red-400' : 'text-gray-400'
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-4 top-4 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Links auxiliares */}
            <div className="flex items-center justify-between">
              {/* Botão de teste (remover em produção) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={fillTestData}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Preencher teste
                </button>
              )}

              <Link
                href="/forgot-password"
                className="text-sm font-medium text-green-600 hover:text-green-500 transition-colors ml-auto"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entrando...
                </>
              ) : (
                'Entrar na conta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Ou continue com
                </span>
              </div>
            </div>

            {/* Login com Google */}
            <button
              onClick={onGoogleLogin}
              disabled={loading}
              className="mt-6 w-full inline-flex justify-center items-center py-4 px-6 border border-gray-200 rounded-2xl shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              <Chrome className="h-5 w-5 text-gray-500 mr-3" />
              Continuar com Google
            </button>
          </div>
        </div>

        {/* Footer do Card */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link
                href="/cadastro"
                className="font-semibold text-green-600 hover:text-green-500 transition-colors"
              >
                Criar conta gratuita
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <div className="mt-8 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Camisas autênticas</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Entrega rápida</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>Suporte 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
