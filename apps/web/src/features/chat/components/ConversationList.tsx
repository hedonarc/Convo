import type { Conversation } from "@shared/types/conversation";
import { Button } from "@shared/ui";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/providers";

import { ConversationItem } from "./ConversationItem";
import { NewChatDialog } from "./NewChatDialog";
import { ConversationListHeader } from "./ConversationListHeader";

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
  const { user, setUser, logout } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);

  const fullName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    user?.username;

  const handleConversationCreated = (conversation: Conversation) => {
    onConversationCreated(conversation);
    setDialogOpen(false);
  };

  return (
    <>
      <aside className="border-border bg-surface flex h-full w-72 shrink-0 flex-col border-r">
        {/* Header */}
        <ConversationListHeader
          user={user}
          setUser={setUser}
          fullName={fullName}
          onNewChat={() => setDialogOpen(true)}
        />

        {/* Conversations */}
        <nav aria-label="Conversations" className="flex-1 overflow-y-auto">
          <ul role="list">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <ConversationItem
                  conversation={conversation}
                  isActive={conversation.id === activeId}
                  onClick={() => onSelect(conversation)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-border border-t p-3">
          <Button
            id="sidebar-logout-button"
            variant="ghost"
            size="sm"
            onClick={logout}
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
        onConversationCreated={handleConversationCreated}
      />
    </>
  );
}
