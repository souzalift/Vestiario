// app/login/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Libs de formulário
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Contexto, UI, e ícones
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Shield,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Chrome,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// 1. Esquema de validação com Zod para o login.
const loginSchema = z.object({
  email: z.string().email('Por favor, insira um email válido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional(),
});

// Gera o tipo TypeScript a partir do esquema
type LoginFormData = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  // Estado de loading para ações fora do formulário principal (ex: Google)
  const [isExternalLoading, setIsExternalLoading] = useState(false);

  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  // 2. Hook de Formulário: Centraliza estado, validação e submissão.
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Se já estiver logado, redirecionar
  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  const handleAuthSuccess = () => {
    toast.success('Login realizado com sucesso!', {
      description: 'Redirecionando...',
      duration: 2000,
    });
    setTimeout(() => {
      router.push(returnUrl);
    }, 500);
  };

  // 3. Função de Submissão: Recebe os dados já validados.
  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      handleAuthSuccess();
    } catch (error: any) {
      console.error('Erro no login:', error);
      let errorMessage = 'Erro ao fazer login';
      let errorDescription = 'Tente novamente';

      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        errorMessage = 'Credenciais incorretas';
        errorDescription = 'Verifique seu email e senha.';
        // Seta um erro geral para ser exibido no topo do formulário
        setError('root.serverError', {
          type: 'manual',
          message: 'Email ou senha incorretos. Por favor, tente novamente.',
        });
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas';
        errorDescription = 'Aguarde alguns minutos e tente novamente.';
        setError('root.serverError', {
          type: 'manual',
          message: 'Acesso bloqueado temporariamente por muitas tentativas.',
        });
      } else {
        setError('root.serverError', {
          type: 'manual',
          message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
        });
      }
      toast.error(errorMessage, { description: errorDescription });
    }
  };

  const handleGoogleLogin = async () => {
    setIsExternalLoading(true);
    try {
      await loginWithGoogle();
      handleAuthSuccess();
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Erro no login com Google', {
          description: 'Por favor, tente novamente.',
        });
      }
    } finally {
      setIsExternalLoading(false);
    }
  };

  // Estado de loading unificado para desabilitar botões
  const isLoading = isSubmitting || isExternalLoading;

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header e botão de voltar (sem alterações) */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-xl">OV</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Entrar na sua conta
            </h2>
            <p className="text-gray-600">
              Bem-vindo de volta! Faça login para continuar.
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-8">
              {/* Exibe erros gerais retornados pelo servidor */}
              {errors.root?.serverError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Erro no login
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {errors.root.serverError.message}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={`pl-10 h-12 border-gray-200 ${
                        errors.email
                          ? 'border-red-300 focus:border-red-400'
                          : ''
                      }`}
                      placeholder="seu@email.com"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium"
                  >
                    Senha
                  </Label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`pl-10 pr-10 h-12 border-gray-200 ${
                        errors.password
                          ? 'border-red-300 focus:border-red-400'
                          : ''
                      }`}
                      placeholder="Sua senha"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox id="remember-me" {...register('rememberMe')} />
                    <Label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700 cursor-pointer"
                    >
                      Lembrar de mim
                    </Label>
                  </div>
                  <Link
                    href="/recuperar-senha"
                    className="text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />{' '}
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              {/* Separador e botão Google */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      ou continue com
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 mt-4 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
              >
                {isExternalLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                ) : (
                  <Chrome className="w-5 h-5 mr-3" />
                )}
                Entrar com Google
              </Button>

              {/* Link para Criar Conta */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Não tem uma conta?{' '}
                  <Link
                    href={`/cadastro${
                      returnUrl !== '/'
                        ? `?returnUrl=${encodeURIComponent(returnUrl)}`
                        : ''
                    }`}
                    className="font-medium text-gray-900 hover:text-gray-700"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card de vantagens (sem alterações) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Vantagens de ter uma conta
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Acompanhe seus pedidos em tempo real
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Salve seus produtos favoritos
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Checkout mais rápido e seguro
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-700" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
