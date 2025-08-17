'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pegar URL de retorno ou usar página inicial
  const returnUrl = searchParams.get('returnUrl') || '/';

  // Se já estiver logado, redirecionar
  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  // Validação básica
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await login(email, password);

      toast.success('Login realizado com sucesso!', {
        description: 'Redirecionando...',
        duration: 2000,
      });

      // Pequeno delay para mostrar o toast
      setTimeout(() => {
        router.push(returnUrl);
      }, 500);
    } catch (error: any) {
      console.error('Erro no login:', error);

      let errorMessage = 'Erro ao fazer login';
      let errorDescription = 'Tente novamente';

      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        errorMessage = 'Credenciais incorretas';
        errorDescription = 'Email ou senha incorretos';
        setErrors({ general: 'Email ou senha incorretos' });
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas';
        errorDescription = 'Aguarde alguns minutos';
        setErrors({ general: 'Muitas tentativas. Aguarde alguns minutos.' });
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Conta desabilitada';
        errorDescription = 'Entre em contato com o suporte';
        setErrors({ general: 'Esta conta foi desabilitada' });
      } else {
        setErrors({ general: error.message || 'Erro inesperado' });
      }

      toast.error(errorMessage, { description: errorDescription });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Implementar login com Google aqui se necessário
      toast.info('Login com Google em breve!');
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      toast.error('Erro no login com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Back Button */}
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

          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-xl">OV</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Entrar na sua conta
            </h2>
            <p className="text-gray-600">
              Bem-vindo de volta! Faça login para continuar
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-8">
              {/* Error Message */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Erro no login
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {errors.general}
                    </p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email)
                          setErrors({ ...errors, email: undefined });
                      }}
                      className={`pl-10 h-12 border-gray-200 focus:border-gray-400 ${
                        errors.email
                          ? 'border-red-300 focus:border-red-400'
                          : ''
                      }`}
                      placeholder="seu@email.com"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
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
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors({ ...errors, password: undefined });
                      }}
                      className={`pl-10 pr-10 h-12 border-gray-200 focus:border-gray-400 ${
                        errors.password
                          ? 'border-red-300 focus:border-red-400'
                          : ''
                      }`}
                      placeholder="Sua senha"
                      disabled={loading}
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
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Lembrar de mim
                    </label>
                  </div>
                  <Link
                    href="/recuperar-senha"
                    className="text-sm font-medium text-gray-900 hover:text-gray-700"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-base disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              {/* Divider */}
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

              {/* Google Login */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-12 mt-4 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
              >
                <Chrome className="w-5 h-5 mr-3" />
                Entrar com Google
              </Button>

              {/* Sign Up Link */}
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

          {/* Benefits */}
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

// O export default agora só faz o suspense boundary
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Carregando...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
