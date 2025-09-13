// app/register/page.tsx
'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Layout e Componentes Reutilizáveis
import AuthLayout from '@/components/auth/AuthLayout';
import SocialAuth from '@/components/auth/SocialAuth';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';

// UI e Ícones
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

// Validação Zod (sem alterações aqui)
const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Por favor, insira um email válido'),
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .refine((val) => /[a-z]/.test(val), {
        message: 'A senha deve conter pelo menos uma letra minúscula',
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: 'A senha deve conter pelo menos uma letra maiúscula',
      })
      .refine((val) => /\d/.test(val), {
        message: 'A senha deve conter pelo menos um número',
      }),
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
  const [passwordValue, setPasswordValue] = useState('');
  // REMOVIDO: O estado 'touchedFields' foi removido para simplificar.

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
    setError,
    control,
    watch,
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

  const watchedPassword = watch('password', '');

  useEffect(() => {
    setPasswordValue(watchedPassword);
  }, [watchedPassword]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  const handleAuthSuccess = useCallback(() => {
    toast.success('Conta criada com sucesso!', {
      description: 'Bem-vindo! Redirecionando...',
    });
    router.push(returnUrl);
  }, [router, returnUrl]);

  // REMOVIDO: As funções 'handleFieldBlur' e 'shouldShowError' foram removidas.

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authRegister(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`.trim(),
      });
      handleAuthSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);

      let message = 'Ocorreu um erro inesperado. Tente novamente.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Este email já está cadastrado.';
          setError('email', { type: 'manual', message });
          break;
        case 'auth/invalid-email':
          message = 'O email fornecido é inválido.';
          setError('email', { type: 'manual', message });
          break;
        case 'auth/weak-password':
          message = 'A senha é muito fraca.';
          setError('password', { type: 'manual', message });
          break;
        case 'auth/operation-not-allowed':
          message = 'Operação não permitida. Contate o suporte.';
          break;
        default:
          message = 'Erro desconhecido durante o cadastro.';
      }

      toast.error('Erro no cadastro', {
        description: message,
        icon: <AlertCircle className="h-5 w-5" />,
      });
    }
  };

  const handleGoogleRegister = async () => {
    setIsExternalLoading(true);
    try {
      await loginWithGoogle();
      handleAuthSuccess();
    } catch (error: any) {
      console.error('Google registration error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Erro no cadastro com Google', {
          description:
            'Não foi possível realizar o cadastro com Google. Tente novamente.',
          icon: <AlertCircle className="h-5 w-5" />,
        });
      }
    } finally {
      setIsExternalLoading(false);
    }
  };

  const isLoading = isSubmitting || isExternalLoading;

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[380px] gap-6">
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Criar sua Conta</h1>
          <p className="text-balance text-muted-foreground">
            Junte-se à nossa comunidade de amantes do desporto.
          </p>
        </div>
        <Card className="mt-4">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    placeholder="João"
                    {...register('firstName')}
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                  />
                  {/* LÓGICA CORRIGIDA */}
                  {errors.firstName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
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
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                  />
                  {/* LÓGICA CORRIGIDA */}
                  {errors.lastName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
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
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {/* LÓGICA CORRIGIDA */}
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    aria-invalid={errors.password ? 'true' : 'false'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordValue && (
                  <PasswordStrengthIndicator password={passwordValue} />
                )}
                {/* LÓGICA CORRIGIDA */}
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
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
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {/* LÓGICA CORRIGIDA */}
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="terms"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true);
                        // A chamada a handleFieldBlur foi removida daqui
                      }}
                      className="mt-0.5"
                      aria-invalid={errors.terms ? 'true' : 'false'}
                    />
                  )}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Aceito os{' '}
                    <Link
                      href="/termos"
                      className="underline hover:text-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      termos de uso
                    </Link>
                    .
                  </Label>
                  {/* LÓGICA CORRIGIDA */}
                  {errors.terms && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.terms.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white"
                disabled={isLoading}
                aria-disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <SocialAuth
              onGoogleClick={handleGoogleRegister}
              isLoading={isExternalLoading}
              actionText="Cadastrar"
            />
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm">
          Já tem uma conta?{' '}
          <Link
            href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="underline hover:text-primary font-medium"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

// Loading component for Suspense fallback
function RegisterLoading() {
  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[380px] gap-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando formulário...</p>
      </div>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterPageContent />
    </Suspense>
  );
}
