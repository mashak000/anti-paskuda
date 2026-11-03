import type { ComponentPropsWithoutRef } from 'react';

type RetroButtonProps = ComponentPropsWithoutRef<'button'>;

export default function Button({
  children,
  className = '',
  type = 'button',
  ...props
}: RetroButtonProps) {
  return (
    <button {...props} type={type} className={`retro-button ${className}`}>
      <span className="retro-button__content">{children}</span>
    </button>
  );
}
