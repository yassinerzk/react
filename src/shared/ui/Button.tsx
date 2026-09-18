import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
}

export function Button({ variant = 'secondary', size = 'md', block, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn('btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className)}
      {...rest}
    />
  );
}
