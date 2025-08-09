'use client';

import { useSearchParams } from 'next/navigation';

export function useRedirect() {
  const searchParams = useSearchParams();

  const getReturnUrl = () => {
    return searchParams.get('returnUrl') || '/';
  };

  const createAuthUrl = (path: string, currentUrl?: string) => {
    const returnUrl = currentUrl || window.location.pathname;
    if (returnUrl === '/' || returnUrl === path) {
      return path;
    }
    return `${path}?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  return {
    getReturnUrl,
    createAuthUrl,
  };
}