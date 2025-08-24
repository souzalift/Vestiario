// app/register/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Layout e Componentes Reutilizáveis
import AuthLayout from '@/components/auth/AuthLayout';
import SocialAuth from '@/components/auth/SocialAuth';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';

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
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos de uso',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

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

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) router.push(returnUrl);
  }, [isAuthenticated, router, returnUrl]);

  const handleAuthSuccess = () => {
    toast.success('Conta criada com sucesso!', {
      description: 'Bem-vindo! Redirecionando...',
    });
    router.push(returnUrl);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authRegister(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`.trim(),
      });
      handleAuthSuccess();
    } catch (error: any) {
      const message =
        error.code === 'auth/email-already-in-use'
          ? 'Este email já está cadastrado.'
          : 'Ocorreu um erro inesperado.';
      setError('email', { type: 'manual', message });
      toast.error('Erro no cadastro', { description: message });
    }
  };

  const handleGoogleRegister = async () => {
    setIsExternalLoading(true);
    try {
      await loginWithGoogle();
      handleAuthSuccess();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Erro no cadastro com Google.');
      }
    } finally {
      setIsExternalLoading(false);
    }
  };

  const isLoading = isSubmitting || isExternalLoading;

  return (
    <AuthLayout>
      <div className="mx-auto grid w-[380px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Criar sua Conta</h1>
          <p className="text-balance text-muted-foreground">
            Junte-se à nossa comunidade de amantes do desporto.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    placeholder="João"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    placeholder="Silva"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <span className="sr-only">Mostrar/Ocultar senha</span>
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <span className="sr-only">Mostrar/Ocultar senha</span>
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
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
                    className="text-sm font-medium cursor-pointer"
                  >
                    Aceito os{' '}
                    <Link href="/termos" className="underline">
                      termos de uso
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
                className="w-full text-white"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Conta
              </Button>
            </form>
            <SocialAuth
              onGoogleClick={handleGoogleRegister}
              isLoading={isExternalLoading}
              actionText="Cadastrar"
            />
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          Já tem uma conta?{' '}
          <Link
            href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="underline"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
