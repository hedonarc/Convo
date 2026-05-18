import type { Conversation } from "@shared/types/conversation";
import { Button } from "@shared/ui";
import { LogOut, MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../providers/auth.provider";
import { ConversationItem } from "./ConversationItem";
import { NewChatDialog } from "./NewChatDialog";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (conversation: Conversation) => void;
  onConversationCreated: () => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onConversationCreated,
}: ConversationListProps) {
  const { user, logout } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreated = () => {
    onConversationCreated();
    setDialogOpen(false);
  };

  return (
    <>
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Messages</h2>
            {user && (
              <p className="text-xs text-text-secondary mt-0.5">@{user.username}</p>
            )}
          </div>
          <button
            type="button"
            id="new-chat-button"
            onClick={() => setDialogOpen(true)}
            aria-label="New conversation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:text-brand hover:bg-brand/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            id="sidebar-logout-button"
            className="w-full justify-start gap-2 text-text-secondary hover:text-text-primary"
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
