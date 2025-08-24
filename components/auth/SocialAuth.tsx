// components/auth/SocialAuth.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Chrome, Loader2 } from 'lucide-react';

interface SocialAuthProps {
  onGoogleClick: () => void;
  isLoading: boolean;
  actionText: 'Entrar' | 'Cadastrar';
}

export default function SocialAuth({
  onGoogleClick,
  isLoading,
  actionText,
}: SocialAuthProps) {
  return (
    <>
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">ou continue com</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onGoogleClick}
        disabled={isLoading}
        className="w-full h-12 mt-6"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-3" />
        ) : (
          <Chrome className="w-5 h-5 mr-3" />
        )}
        {actionText} com Google
      </Button>
    </>
  );
}
