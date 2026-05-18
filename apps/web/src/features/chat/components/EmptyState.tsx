import { MessageSquarePlus } from "lucide-react";
import { UserSearchPanel } from "./UserSearchPanel";

interface EmptyStateProps {
  onConversationCreated: () => void;
}

export function EmptyState({ onConversationCreated }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      {/* Icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10">
        <MessageSquarePlus className="h-10 w-10 text-brand" />
      </div>

      {/* Copy */}
      <div className="text-center space-y-2 max-w-xs">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
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
