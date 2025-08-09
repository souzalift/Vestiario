'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailPasswordLogin = async (email: string, password: string) => {
    setLoading(true);

    try {
      await login(email, password);

      toast.success('Login realizado com sucesso!', {
        description: 'Redirecionando para a página inicial...',
        duration: 2000,
      });

      // Pequeno delay para mostrar o toast
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error: any) {
      console.error('Erro no login:', error);

      // Tratar diferentes tipos de erro
      if (
        error.message.includes('Email ou senha incorretos') ||
        error.message.includes('incorreta') ||
        error.message.includes('não encontrado')
      ) {
        setErrors({
          general:
            'Email ou senha incorretos. Verifique suas credenciais e tente novamente.',
        });
        toast.error('Credenciais incorretas', {
          description: 'Verifique seu email e senha',
        });
      } else if (error.message.includes('muitas tentativas')) {
        setErrors({
          general:
            'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
        });
        toast.error('Muitas tentativas', {
          description: 'Aguarde alguns minutos',
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
        toast.error('Erro ao fazer login', {
          description: error.message || 'Tente novamente',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrors({});

    try {
      await loginWithGoogle();

      toast.success('Login realizado com sucesso!', {
        description: 'Bem-vindo ao O Vestiário!',
        duration: 2000,
      });

      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error: any) {
      console.error('Erro no login com Google:', error);

      if (error.message.includes('cancelado')) {
        // Não mostrar erro se usuário cancelou
        return;
      }

      setErrors({
        general: error.message || 'Erro ao fazer login com Google',
      });

      toast.error('Erro no login com Google', {
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
        <LoginForm
          onEmailPasswordLogin={handleEmailPasswordLogin}
          onGoogleLogin={handleGoogleLogin}
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
