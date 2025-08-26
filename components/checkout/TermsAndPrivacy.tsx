'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

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
    <Card>
      <CardContent className="space-y-4 py-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            disabled={disabled}
            onCheckedChange={setAcceptedTerms}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
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
          <Checkbox
            id="privacy"
            checked={acceptedPrivacy}
            disabled={disabled}
            onCheckedChange={setAcceptedPrivacy}
            className="mt-1"
          />
          <label htmlFor="privacy" className="text-sm text-gray-700">
            Aceito a{' '}
            <Link
              href="/privacidade"
              className="text-gray-900 underline hover:text-gray-700"
            >
              política de privacidade
            </Link>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
