import { forwardRef, type ComponentPropsWithoutRef } from 'react';

type SelectProps = ComponentPropsWithoutRef<'select'>;
// TO DO style the drop down menu 
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ children, className = '', ...props }, ref) {
    return (
      <div className="dossier-select">
        <select
          {...props}
          ref={ref}
          className={`dossier-control dossier-select__control ${className}`}
        >
          {children}
        </select>

        <span className="dossier-select__arrow" aria-hidden="true" />
      </div>
    );
  },
);
