import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn('chip', active && 'chip--active', className)}
      {...rest}
    />
  );
}
