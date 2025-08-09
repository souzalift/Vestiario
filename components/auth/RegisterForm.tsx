'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Chrome,
  AlertCircle,
} from 'lucide-react';

interface RegisterFormProps {
  onEmailPasswordRegister: (
    email: string,
    password: string,
    name: string,
  ) => Promise<void>;
  onGoogleRegister: () => Promise<void>;
  loading: boolean;
  errors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  };
  onErrorsChange: (errors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }) => void;
}

export default function RegisterForm({
  onEmailPasswordRegister,
  onGoogleRegister,
  loading,
  errors,
  onErrorsChange,
}: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Limpar erros quando usuário digitar
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name || errors.general) {
      onErrorsChange({
        ...errors,
        name: undefined,
        general: undefined,
      });
    }
  };

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

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword || errors.general) {
      onErrorsChange({
        ...errors,
        confirmPassword: undefined,
        general: undefined,
      });
    }
  };

  // Validação de campos
  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
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

    await onEmailPasswordRegister(
      email.trim().toLowerCase(),
      password,
      name.trim(),
    );
  };

  // Função para preencher dados de teste (remover em produção)
  const fillTestData = () => {
    setName('João da Silva');
    setEmail('joao@exemplo.com');
    setPassword('123456');
    setConfirmPassword('123456');
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
          Junte-se ao O Vestiário
        </h1>
        <p className="text-gray-600">
          Crie sua conta e descubra as melhores camisas de futebol do mundo
        </p>
      </div>

      {/* Erro geral */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Erro no cadastro
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
            {/* Nome */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Nome completo
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={handleNameChange}
                  className={`block w-full px-4 py-4 pl-12 text-gray-900 border rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                    errors.name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-green-500'
                  }`}
                  placeholder="Seu nome completo"
                />
                <User
                  className={`absolute left-4 top-4 h-5 w-5 ${
                    errors.name ? 'text-red-400' : 'text-gray-400'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className={`block w-full px-4 py-4 pl-12 pr-12 text-gray-900 border rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-green-500'
                  }`}
                  placeholder="Mínimo 6 caracteres"
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

            {/* Confirmar Senha */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`block w-full px-4 py-4 pl-12 pr-12 text-gray-900 border rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-green-500'
                  }`}
                  placeholder="Confirme sua senha"
                />
                <Lock
                  className={`absolute left-4 top-4 h-5 w-5 ${
                    errors.confirmPassword ? 'text-red-400' : 'text-gray-400'
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-4 top-4 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Indicador de força da senha */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  ></div>
                  <span
                    className={
                      password.length >= 6 ? 'text-green-600' : 'text-gray-500'
                    }
                  >
                    Pelo menos 6 caracteres
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      password === confirmPassword && confirmPassword
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                  <span
                    className={
                      password === confirmPassword && confirmPassword
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }
                  >
                    Senhas coincidem
                  </span>
                </div>
              </div>
            )}

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
            </div>

            {/* Botão de Cadastro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </>
              ) : (
                'Criar conta gratuita'
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
              onClick={onGoogleRegister}
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
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="font-semibold text-green-600 hover:text-green-500 transition-colors"
              >
                Entrar agora
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
            <span>Conta gratuita</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Sem taxas ocultas</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span>Acesso completo</span>
          </div>
        </div>
      </div>

      {/* Termos e Privacidade */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Ao criar uma conta, você concorda com nossos{' '}
          <Link href="/termos" className="text-green-600 hover:text-green-500">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link
            href="/privacidade"
            className="text-green-600 hover:text-green-500"
          >
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
