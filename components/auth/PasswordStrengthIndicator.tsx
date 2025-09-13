// components/auth/PasswordStrengthIndicator.tsx
interface PasswordStrengthIndicatorProps {
  password?: string;
}

export default function PasswordStrengthIndicator({
  password = '',
}: PasswordStrengthIndicatorProps) {
  const getStrength = (pwd: string) => {
    if (!pwd || pwd.length === 0) return 0;

    let strength = 0;
    if (pwd.length >= 6) strength += 20;
    if (/[a-z]/.test(pwd)) strength += 20;
    if (/[A-Z]/.test(pwd)) strength += 20;
    if (/\d/.test(pwd)) strength += 20;
    if (/[^a-zA-Z\d]/.test(pwd)) strength += 20;

    return strength;
  };

  const strength = getStrength(password);
  const strengthText =
    strength >= 80
      ? 'Forte'
      : strength >= 60
      ? 'Boa'
      : strength >= 40
      ? 'Média'
      : strength >= 20
      ? 'Fraca'
      : 'Muito fraca';

  const strengthColor =
    strength >= 80
      ? 'bg-green-500'
      : strength >= 60
      ? 'bg-green-400'
      : strength >= 40
      ? 'bg-yellow-500'
      : strength >= 20
      ? 'bg-orange-500'
      : 'bg-red-500';

  // Don't show anything if password is empty
  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span>Força da senha:</span>
        <span className="font-medium">{strengthText}</span>
      </div>
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${strengthColor} transition-all duration-300`}
          style={{ width: `${strength}%` }}
        />
      </div>
      <ul className="text-xs text-muted-foreground space-y-1 mt-2">
        <li className={password.length >= 6 ? 'text-green-600' : ''}>
          • Pelo menos 6 caracteres
        </li>
        <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
          • Letra minúscula
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
          • Letra maiúscula
        </li>
        <li className={/\d/.test(password) ? 'text-green-600' : ''}>
          • Número
        </li>
      </ul>
    </div>
  );
}
