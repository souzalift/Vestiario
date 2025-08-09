// app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  CheckCircle,
  AlertCircle,
  Loader2,
  Chrome,
  Zap,
  Gift,
  Clock,
} from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { register, loginWithGoogle, isAuthenticated } = useAuth();
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

  // Atualizar dados do formulário
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando o usuário digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nome
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar sobrenome
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Sobrenome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'Senha deve conter pelo menos: 1 maiúscula, 1 minúscula e 1 número';
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    // Validar termos
    if (!acceptedTerms) {
      newErrors.terms = 'Você deve aceitar os termos de uso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcular força da senha
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    const checks = [
      password.length >= 6,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 10,
    ];

    strength = checks.filter(Boolean).length;

    if (strength <= 2)
      return { strength: 33, label: 'Fraca', color: 'bg-red-500' };
    if (strength <= 4)
      return { strength: 66, label: 'Média', color: 'bg-yellow-500' };
    return { strength: 100, label: 'Forte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Passar dados adicionais para o registro
      await register(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
      });

      toast.success('Conta criada com sucesso!', {
        description: 'Bem-vindo ao O Vestiário! Redirecionando...',
        duration: 3000,
      });

      setTimeout(() => {
        router.push(returnUrl);
      }, 1000);
    } catch (error: any) {
      console.error('Erro no registro:', error);

      let errorMessage = 'Erro ao criar conta';
      let errorDescription = 'Tente novamente';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email já está em uso';
        errorDescription = 'Tente fazer login ou use outro email';
        setErrors({ email: 'Este email já está cadastrado' });
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca';
        errorDescription = 'Use uma senha mais forte';
        setErrors({ password: 'Senha muito fraca' });
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
        errorDescription = 'Verifique o formato do email';
        setErrors({ email: 'Email inválido' });
      } else {
        setErrors({ general: error.message || 'Erro inesperado' });
      }

      toast.error(errorMessage, { description: errorDescription });
    } finally {
      setLoading(false);
    }
  };

  // Login com Google
  const handleGoogleRegister = async () => {
    setLoading(true);
    setErrors({});

    try {
      await loginWithGoogle();

      toast.success('Conta criada com sucesso!', {
        description: 'Bem-vindo ao O Vestiário! Redirecionando...',
        duration: 3000,
      });

      setTimeout(() => {
        router.push(returnUrl);
      }, 1000);
    } catch (error: any) {
      console.error('Erro no registro com Google:', error);

      if (error.message === 'Login cancelado pelo usuário') {
        toast.info('Cadastro cancelado');
      } else {
        toast.error('Erro no cadastro com Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

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
              Criar sua conta
            </h2>
            <p className="text-gray-600">
              Junte-se à nossa comunidade de amantes do futebol
            </p>
          </div>

          {/* Register Card */}
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-8">
              {/* Error Message */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Erro no cadastro
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {errors.general}
                    </p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nome e Sobrenome */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="text-gray-700 font-medium"
                    >
                      Nome
                    </Label>
                    <div className="mt-1 relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          updateFormData('firstName', e.target.value)
                        }
                        className={`pl-10 h-12 border-gray-200 focus:border-gray-400 ${
                          errors.firstName
                            ? 'border-red-300 focus:border-red-400'
                            : ''
                        }`}
                        placeholder="João"
                        disabled={loading}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="lastName"
                      className="text-gray-700 font-medium"
                    >
                      Sobrenome
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          updateFormData('lastName', e.target.value)
                        }
                        className={`h-12 border-gray-200 focus:border-gray-400 ${
                          errors.lastName
                            ? 'border-red-300 focus:border-red-400'
                            : ''
                        }`}
                        placeholder="Silva"
                        disabled={loading}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

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
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className={`pl-10 h-12 border-gray-200 focus:border-gray-400 ${
                        errors.email
                          ? 'border-red-300 focus:border-red-400'
                          : ''
                      }`}
                      placeholder="joao@email.com"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Senha */}
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
                      value={formData.password}
                      onChange={(e) =>
                        updateFormData('password', e.target.value)
                      }
                      className={`pl-10 pr-10 h-12 border-gray-200 focus:border-gray-400 ${
                        errors.password
                          ? 'border-red-300 focus:border-red-400'
                          : ''
                      }`}
                      placeholder="Sua senha segura"
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

                  {/* Password Strength */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Força da senha:</span>
                        <span
                          className={`font-medium ${
                            passwordStrength.strength === 100
                              ? 'text-green-600'
                              : passwordStrength.strength === 66
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-700 font-medium"
                  >
                    Confirmar Senha
                  </Label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        updateFormData('confirmPassword', e.target.value)
                      }
                      className={`pl-10 pr-10 h-12 border-gray-200 focus:border-gray-400 ${
                        errors.confirmPassword
                          ? 'border-red-300 focus:border-red-400'
                          : ''
                      }`}
                      placeholder="Confirme sua senha"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => {
                      // Converter CheckedState para boolean
                      setAcceptedTerms(checked === true);
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Aceito os{' '}
                      <Link
                        href="/termos"
                        className="font-medium text-gray-900 hover:text-gray-700 underline"
                      >
                        termos de uso
                      </Link>{' '}
                      e a{' '}
                      <Link
                        href="/privacidade"
                        className="font-medium text-gray-900 hover:text-gray-700 underline"
                      >
                        política de privacidade
                      </Link>
                    </label>
                    {errors.terms && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.terms}
                      </p>
                    )}
                  </div>
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
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta'
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

              {/* Google Register */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleRegister}
                disabled={loading}
                className="w-full h-12 mt-4 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
              >
                <Chrome className="w-5 h-5 mr-3" />
                Cadastrar com Google
              </Button>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Já tem uma conta?{' '}
                  <Link
                    href={`/login${
                      returnUrl !== '/'
                        ? `?returnUrl=${encodeURIComponent(returnUrl)}`
                        : ''
                    }`}
                    className="font-medium text-gray-900 hover:text-gray-700"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
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

      <Footer />
    </div>
  );
}
