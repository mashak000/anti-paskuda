import { useEffect, useId, useRef, type ReactNode } from 'react';
import Button from './Button';

type ModalProps = {
  open: boolean;
  title: string;
  closeLabel?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  isClosable?: boolean;
};

export default function Modal({
  open,
  title,
  closeLabel,
  onClose,
  children,
  footer,
  isClosable = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [open]);
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="retro-modal"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="retro-modal__header">
        <h2 id={titleId} className="min-w-0 text-1.5xl wrap-break-word press-start-2p-regular ">
          {title}
        </h2>

        {isClosable && (
          <Button
            onClick={onClose}
            aria-label={closeLabel}
            className="size-7 min-h-0 shrink-0 p-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="30"
              height="30"
              className="shrink-0"
            >
              <path
                d="M4 4L20 20M20 4L4 20"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
              />
            </svg>
          </Button>
        )}
      </header>

      <div className="p-5 sm:p-6">{children}</div>

      {footer && (
        <footer className="flex flex-wrap justify-end gap-3 px-5 pb-5 sm:px-6">
          {footer}
        </footer>
      )}
    </dialog>
  );
}
