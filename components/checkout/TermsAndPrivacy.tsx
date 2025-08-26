'use client';

import Link from 'next/link';

interface TermsAndPrivacyProps {
  acceptedTerms: boolean;
  setAcceptedTerms: (val: boolean) => void;
  acceptedPrivacy: boolean;
  setAcceptedPrivacy: (val: boolean) => void;
  disabled?: boolean;
}

export default function TermsAndPrivacy({
  acceptedTerms,
  setAcceptedTerms,
  acceptedPrivacy,
  setAcceptedPrivacy,
  disabled,
}: TermsAndPrivacyProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={acceptedTerms}
          disabled={disabled}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 h-4 w-4 text-gray-900 rounded border-gray-300"
        />
        <label className="text-sm text-gray-700">
          Aceito os{' '}
          <Link
            href="/termos"
            className="text-gray-900 underline hover:text-gray-700"
          >
            termos de uso
          </Link>{' '}
          e{' '}
          <Link
            href="/condicoes"
            className="text-gray-900 underline hover:text-gray-700"
          >
            condições de venda
          </Link>
        </label>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={acceptedPrivacy}
          disabled={disabled}
          onChange={(e) => setAcceptedPrivacy(e.target.checked)}
          className="mt-1 h-4 w-4 text-gray-900 rounded border-gray-300"
        />
        <label className="text-sm text-gray-700">
          Aceito a{' '}
          <Link
            href="/privacidade"
            className="text-gray-900 underline hover:text-gray-700"
          >
            política de privacidade
          </Link>
        </label>
      </div>
    </div>
  );
}
