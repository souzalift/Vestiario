// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailPasswordRegister = async (
    email: string,
    password: string,
    name: string,
  ) => {
    setLoading(true);

    try {
      await register(email, password, name);

      toast.success('Conta criada com sucesso!', {
        description: 'Faça login para continuar.',
        duration: 3000,
      });

      // Pequeno delay para mostrar o toast
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (error: any) {
      console.error('Erro no cadastro:', error);

      // Tratar diferentes tipos de erro
      if (error.message.includes('já está em uso')) {
        setErrors({
          email: 'Este email já está em uso',
          general:
            'Este email já possui uma conta. Faça login ou use outro email.',
        });
        toast.error('Email já cadastrado', {
          description: 'Use outro email ou faça login',
        });
      } else if (error.message.includes('muito fraca')) {
        setErrors({
          password: 'Senha muito fraca',
          general: 'Escolha uma senha mais forte.',
        });
        toast.error('Senha muito fraca', {
          description: 'Use pelo menos 6 caracteres',
        });
      } else if (error.message.includes('inválido')) {
        setErrors({
          email: 'Email inválido',
          general: 'Verifique o formato do email.',
        });
        toast.error('Email inválido', {
          description: 'Verifique o formato do email',
        });
      } else if (
        error.message.includes('conexão') ||
        error.message.includes('internet')
      ) {
        setErrors({
          general:
            'Problema de conexão. Verifique sua internet e tente novamente.',
        });
        toast.error('Erro de conexão', {
          description: 'Verifique sua internet',
        });
      } else {
        setErrors({
          general: error.message || 'Erro inesperado. Tente novamente.',
        });
        toast.error('Erro ao criar conta', {
          description: error.message || 'Tente novamente',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setErrors({});

    try {
      await loginWithGoogle();

      toast.success('Cadastro realizado com sucesso!', {
        description: 'Bem-vindo ao O Vestiário!',
        duration: 2000,
      });

      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error: any) {
      console.error('Erro no cadastro com Google:', error);

      if (error.message.includes('cancelado')) {
        // Não mostrar erro se usuário cancelou
        return;
      }

      setErrors({
        general: error.message || 'Erro ao cadastrar com Google',
      });

      toast.error('Erro no cadastro com Google', {
        description: error.message || 'Tente novamente',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <RegisterForm
          onEmailPasswordRegister={handleEmailPasswordRegister}
          onGoogleRegister={handleGoogleRegister}
          loading={loading}
          errors={errors}
          onErrorsChange={setErrors}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
