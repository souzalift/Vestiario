// app/login/page.tsx
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
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Por favor, insira um email válido'),
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isExternalLoading, setIsExternalLoading] = useState(false);
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) router.push(callbackUrl);
  }, [isAuthenticated, router, callbackUrl]);

  const handleAuthSuccess = () => {
    toast.success('Login realizado com sucesso!', {
      description: 'Redirecionando...',
    });
    router.push(callbackUrl);
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      handleAuthSuccess();
    } catch (error: any) {
      const message =
        error.code === 'auth/invalid-credential'
          ? 'Email ou senha incorretos.'
          : 'Ocorreu um erro. Tente novamente.';
      setError('root.serverError', { type: 'manual', message });
      toast.error('Erro no login', { description: message });
    }
  };

  const handleGoogleLogin = async () => {
    setIsExternalLoading(true);
    try {
      await loginWithGoogle();
      handleAuthSuccess();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Erro no login com Google.');
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
          <h1 className="text-3xl font-bold">Entrar na sua Conta</h1>
          <p className="text-balance text-muted-foreground">
            Bem-vindo de volta! Faça login para continuar.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              {errors.root?.serverError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-sm text-red-800">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p>{errors.root.serverError.message}</p>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                    className="pl-9"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="pl-9 pr-10"
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
                  <p className="text-sm text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember-me" {...register('rememberMe')} />
                  <Label htmlFor="remember-me" className="cursor-pointer">
                    Lembrar de mim
                  </Label>
                </div>
                <Link href="/recuperar-senha" className="text-sm underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full text-white"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
            <SocialAuth
              onGoogleClick={handleGoogleLogin}
              isLoading={isExternalLoading}
              actionText="Entrar"
            />
          </CardContent>
        </Card>
        <div className="mt-4 text-center text-sm">
          Não tem uma conta?{' '}
          <Link
            href={`/cadastro?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="underline"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
