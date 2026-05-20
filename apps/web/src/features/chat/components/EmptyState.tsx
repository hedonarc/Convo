import type { Conversation } from "@shared/types/conversation";
import { MessageSquarePlus } from "lucide-react";

import { UserSearchPanel } from "./UserSearchPanel";

interface EmptyStateProps {
  onConversationCreated: (conversation: Conversation) => void;
}

export function EmptyState({ onConversationCreated }: EmptyStateProps) {
  return (
    <div className="center flex-1 flex-col gap-8 px-6">
      {/* Icon */}
      <div className="center bg-brand/10 h-20 w-20 rounded-2xl">
        <MessageSquarePlus className="text-brand h-10 w-10" />
      </div>

      {/* Copy */}
      <div className="max-w-xs space-y-2 text-center">
        <h1 className="text-text-primary text-2xl font-bold tracking-tight">
          Start a conversation
        </h1>
        <p className="text-text-secondary text-sm leading-relaxed">
          Search for someone by their username or email to send them a message.
        </p>
      </div>

      {/* Search */}
      <UserSearchPanel onConversationCreated={onConversationCreated} />
    </div>
  );
}
