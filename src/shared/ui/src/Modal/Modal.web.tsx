import { X } from "lucide-react";
import * as React from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/shared/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name. If you also render a visible title via ModalHeader, the same string is fine. */
  ariaLabel: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Centered, backdrop-blurred dialog with ESC-to-close and click-outside-to-close.
 *
 * Note: this is the lightweight hand-rolled chrome shared by every modal in the
 * app. It does NOT trap focus or restore focus on close; for production-grade
 * a11y, swap the inner shell for `@radix-ui/react-dialog` and keep the same
 * compound API.
 */
const Modal = ({
  open,
  onClose,
  ariaLabel,
  className,
  children,
}: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={handleBackdropClick}
      className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm duration-150"
    >
      <div
        className={cn(
          "border-border bg-surface animate-in zoom-in-95 relative w-full max-w-md rounded-xl border shadow-2xl duration-150",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};
Modal.displayName = "Modal";

export interface ModalHeaderProps {
  /** When provided, renders the standard close (X) button on the right. */
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

const ModalHeader = ({ onClose, className, children }: ModalHeaderProps) => (
  <div
    className={cn(
      "border-border flex items-center justify-between border-b px-6 py-4",
      className,
    )}
  >
    <h2 className="text-text-primary text-lg font-semibold">{children}</h2>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="text-text-secondary hover:text-text-primary hover:bg-brand/5 focus-visible:ring-ring rounded-md p-1.5 transition-colors focus-visible:ring-1 focus-visible:outline-none"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);
ModalHeader.displayName = "ModalHeader";

export interface ModalFooterProps {
  className?: string;
  children: React.ReactNode;
}

const ModalFooter = ({ className, children }: ModalFooterProps) => (
  <div
    className={cn(
      "border-border flex items-center justify-end gap-2 border-t px-6 py-4",
      className,
    )}
  >
    {children}
  </div>
);
ModalFooter.displayName = "ModalFooter";

export { Modal, ModalFooter, ModalHeader };
