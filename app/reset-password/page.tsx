'use client';

import { Suspense } from 'react';
import ResetPasswordContent from './ResetPasswordContent';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Carregando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
