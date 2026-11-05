import { forwardRef, type ComponentPropsWithoutRef } from 'react';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  suffix?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', suffix, ...props },
  ref,
) {
  return (
    <div className={`dossier-input ${className}`}>
      <input
        {...props}
        ref={ref}
        className={`dossier-control${suffix ? ' dossier-control--with-suffix' : ''}`}
      />
      {suffix && (
        <span className="dossier-input__suffix" aria-hidden="true">
          {suffix}
        </span>
      )}
    </div>
  );
});
