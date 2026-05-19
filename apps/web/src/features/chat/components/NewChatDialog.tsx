import type { Conversation } from "@shared/types/conversation";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { UserSearchPanel } from "./UserSearchPanel";

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export function NewChatDialog({
  open,
  onClose,
  onConversationCreated,
}: NewChatDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Trap clicks on backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  const handleCreated = (conversation: Conversation) => {
    onConversationCreated(conversation);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Start a new conversation"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150"
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-surface shadow-2xl p-6 mx-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-primary">
            New conversation
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-text-secondary hover:text-text-primary hover:bg-brand/5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search panel */}
        <UserSearchPanel
          onConversationCreated={handleCreated}
          compact
        />
      </div>
    </div>
  );
}
