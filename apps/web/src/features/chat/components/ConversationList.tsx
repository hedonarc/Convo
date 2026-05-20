import type { Conversation } from "@shared/types/conversation";
import { Button } from "@shared/ui";
import { LogOut, MessageSquarePlus } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/providers";

import { ConversationItem } from "./ConversationItem";
import { NewChatDialog } from "./NewChatDialog";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (conversation: Conversation) => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onConversationCreated,
}: ConversationListProps) {
  const { user, logout } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreated = (conversation: Conversation) => {
    onConversationCreated(conversation);
    setDialogOpen(false);
  };

  return (
    <>
      <aside className="border-border bg-surface flex h-full w-72 shrink-0 flex-col border-r">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-4 py-4">
          <div>
            <h2 className="text-text-primary text-base font-semibold">
              Messages
            </h2>
            {user && (
              <p className="text-text-secondary mt-0.5 text-xs">
                @{user.username}
              </p>
            )}
          </div>
          <button
            type="button"
            id="new-chat-button"
            onClick={() => setDialogOpen(true)}
            aria-label="New conversation"
            className="text-text-secondary hover:text-brand hover:bg-brand/10 focus-visible:ring-ring flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        </div>

        {/* Conversation list */}
        <nav aria-label="Conversations" className="flex-1 overflow-y-auto">
          <ul role="list">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <ConversationItem
                  conversation={conv}
                  isActive={conv.id === activeId}
                  onClick={() => onSelect(conv)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer — logout */}
        <div className="border-border border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            id="sidebar-logout-button"
            className="text-text-secondary hover:text-text-primary w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <NewChatDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConversationCreated={handleCreated}
      />
    </>
  );
}
