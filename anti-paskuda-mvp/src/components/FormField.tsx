import { useId, type ReactNode } from 'react';

type ControlProps = {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
};

type FormFieldProps = {
  label: ReactNode;
  hint?: string;
  error?: string;
  children: (controlProps: ControlProps) => ReactNode;
};

export function FormField({ label, hint, error, children }: FormFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="dossier-field">
      <label htmlFor={id} className="dossier-field__label">
        {label}
      </label>

      {children({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
      })}

      {hint && (
        <p id={hintId} className="dossier-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="dossier-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
