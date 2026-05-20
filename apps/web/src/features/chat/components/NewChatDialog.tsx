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
      className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm duration-150"
    >
      <div className="border-border bg-surface animate-in zoom-in-95 relative mx-4 w-full max-w-md rounded-xl border p-6 shadow-2xl duration-150">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-text-primary text-lg font-semibold">
            New conversation
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-text-secondary hover:text-text-primary hover:bg-brand/5 focus-visible:ring-ring rounded-md p-1.5 transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search panel */}
        <UserSearchPanel onConversationCreated={handleCreated} compact />
      </div>
    </div>
  );
}
