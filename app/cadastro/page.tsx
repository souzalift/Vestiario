// app/register/page.tsx
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Shield,
  Star,
  AlertCircle,
  Loader2,
  Chrome,
  Zap,
  Gift,
  Clock,
} from 'lucide-react';

// 1. Esquema de validação com Zod: Define a "forma" e as regras do formulário.
const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Por favor, insira um email válido'),
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Deve conter maiúscula, minúscula e número',
      ),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos de uso',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'], // Aplica o erro no campo de confirmação
  });

// Gera o tipo TypeScript a partir do esquema Zod
type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isExternalLoading, setIsExternalLoading] = useState(false);

  const {
    register: authRegister,
    loginWithGoogle,
    isAuthenticated,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  // 2. Hook de Formulário: Centraliza todo o estado e lógica.
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const passwordValue = watch('password', '');

  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  const getPasswordStrength = () => {
    if (!passwordValue) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (passwordValue.length >= 6) strength++;
    if (/[a-z]/.test(passwordValue)) strength++;
    if (/[A-Z]/.test(passwordValue)) strength++;
    if (/\d/.test(passwordValue)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) strength++;
    if (passwordValue.length >= 10) strength++;

    if (strength <= 2)
      return { strength: 33, label: 'Fraca', color: 'bg-red-500' };
    if (strength <= 4)
      return { strength: 66, label: 'Média', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Forte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  const handleAuthSuccess = () => {
    toast.success('Conta criada com sucesso!', {
      description: 'Bem-vindo ao O Vestiário! Redirecionando...',
      duration: 3000,
    });
    setTimeout(() => router.push(returnUrl), 1500);
  };

  // 3. Função de Submissão: Recebe os dados já validados.
  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authRegister(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`.trim(),
      });
      handleAuthSuccess();
    } catch (error: any) {
      console.error('Erro no registro:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email já está em uso', {
          description: 'Tente fazer login ou use outro email.',
        });
        setError('email', {
          type: 'manual',
          message: 'Este email já está cadastrado',
        });
      } else {
        toast.error('Erro ao criar conta', {
          description: 'Ocorreu um erro inesperado. Tente novamente.',
        });
        setError('root.serverError', {
          message:
            'Não foi possível criar sua conta. Por favor, tente mais tarde.',
        });
      }
    }
  };

  const handleGoogleRegister = async () => {
    setIsExternalLoading(true);
    try {
      await loginWithGoogle();
      handleAuthSuccess();
    } catch (error: any) {
      console.error('Erro no registro com Google:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Erro no cadastro com Google', {
          description: 'Por favor, tente novamente.',
        });
      }
    } finally {
      setIsExternalLoading(false);
    }
  };

  const isLoading = isSubmitting || isExternalLoading;

  return (
    <div className="bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
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
              Criar sua conta
            </h2>
            <p className="text-gray-600">
              Junte-se à nossa comunidade de amantes do esporte.
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-8">
              {errors.root?.serverError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Erro no Cadastro
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {errors.root.serverError.message}
                    </p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nome</Label>
                    <div className="mt-1 relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        className={`pl-10 h-12 ${
                          errors.firstName
                            ? 'border-red-500'
                            : 'border-gray-200'
                        }`}
                        placeholder="João"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <div className="mt-1">
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        className={`h-12 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Silva"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={`pl-10 h-12 ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="joao@email.com"
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
                  <Label htmlFor="password">Senha</Label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`pl-10 pr-10 h-12 ${
                        errors.password ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Sua senha segura"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {passwordValue && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Força da senha:</span>
                        <span
                          className={`font-medium ${passwordStrength.color.replace(
                            'bg-',
                            'text-',
                          )}`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className={`pl-10 pr-10 h-12 ${
                        errors.confirmPassword
                          ? 'border-red-500'
                          : 'border-gray-200'
                      }`}
                      placeholder="Confirme sua senha"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="terms"
                    {...register('terms')}
                    className="mt-0.5"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Aceito os{' '}
                      <Link
                        href="/termos"
                        className="font-semibold text-gray-900 underline"
                      >
                        termos de uso
                      </Link>{' '}
                      e a{' '}
                      <Link
                        href="/privacidade"
                        className="font-semibold text-gray-900 underline"
                      >
                        política de privacidade
                      </Link>
                      .
                    </Label>
                    {errors.terms && (
                      <p className="text-sm text-red-600">
                        {errors.terms.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Criando
                      conta...
                    </>
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </form>

              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    ou continue com
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleRegister}
                disabled={isLoading}
                className="w-full h-12 mt-6"
              >
                {isExternalLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                ) : (
                  <Chrome className="w-5 h-5 mr-3" />
                )}
                Cadastrar com Google
              </Button>

              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Já tem uma conta?{' '}
                  <Link
                    href={`/login${
                      returnUrl !== '/'
                        ? `?returnUrl=${encodeURIComponent(returnUrl)}`
                        : ''
                    }`}
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Por que criar uma conta?
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Checkout mais rápido em compras futuras
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Salve seus produtos favoritos
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Acompanhe seus pedidos em tempo real
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Gift className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Receba ofertas exclusivas por email
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-700" />
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
