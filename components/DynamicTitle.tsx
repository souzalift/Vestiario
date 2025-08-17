'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

function beautifyRoute(pathname: string) {
  if (pathname === '/' || pathname === '') return 'Home';

  // Remove query params/hash, divide por "/"
  const cleanPath = pathname.split(/[?#]/)[0];
  const parts = cleanPath
    .split('/')
    .filter(Boolean)
    .map((str) =>
      str.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    );

  // Se a primeira parte for "produto" ou "produtos", remove
  if (parts[0]?.toLowerCase().startsWith('produto')) {
    parts.shift();
  }

  return parts.join(' / ');
}

function DynamicTitle() {
  const pathname = usePathname();

  useEffect(() => {
    const route = beautifyRoute(pathname);
    document.title = `${route} - O Vestiário`;
  }, [pathname]);

  return null;
}

export default DynamicTitle;
