'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import NewProductPage from '@/components/NewProduct';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function AdminNewProductPage() {
  const router = useRouter();

  // Fecha o modal ao pressionar ESC ou clicar fora
  const handleClose = () => {
    router.back();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-xl w-full p-0">
        <DialogTitle className="sr-only">Novo Produto</DialogTitle>
        <NewProductPage />
      </DialogContent>
    </Dialog>
  );
}
