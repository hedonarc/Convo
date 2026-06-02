import { useState } from "react";

import { useAuth } from "@/providers";
import type { Conversation } from "@/shared/types/conversation";

import { ConversationItem } from "./ConversationItem";
import { ConversationListHeader } from "./ConversationListHeader";
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
  const { user } = useAuth();

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
      <aside className="border-border bg-surface flex h-full w-full shrink-0 flex-col border-r md:w-72">
        {/* Header */}
        <ConversationListHeader
          user={user}
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
      </aside>

      <NewChatDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConversationCreated={handleConversationCreated}
      />
    </>
  );
}
