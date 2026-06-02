import axios from "axios";

import { conversationsApi } from "@/shared/api";
import { inviteText, sharedText } from "@/shared/constants/strings/index.en";
import type { Conversation } from "@/shared/types/conversation";
import type { User } from "@/shared/types/user";
import { Spinner } from "@/shared/ui";
import { cn } from "@/shared/utils";

import { useUserSearch } from "../hooks/useUserSearch";
import { useUserSearchPanelStatus } from "../hooks/useUserSearchPanelStatus";
import { InviteByEmailCta } from "./InviteByEmailCta";
import { SearchField } from "./SearchField";
import { UserResultList } from "./UserResultList";

interface UserSearchPanelProps {
  onConversationCreated: (conversation: Conversation) => void;
  /** compact = inline panel (used inside NewChatDialog) */
  compact?: boolean;
}

export function UserSearchPanel({
  onConversationCreated,
  compact = false,
}: UserSearchPanelProps) {
  const { query, setQuery, users, isSearching, searchError, clearSearch } =
    useUserSearch();
  const {
    creatingId,
    isInviting,
    inviteSent,
    createError,
    remainingTime,
    reset,
    startConversation,
    startInvite,
    resolveReminderSent,
    resolveError,
  } = useUserSearchPanelStatus();

  const handleQueryChange = (value: string) => {
    setQuery(value);
    reset();
  };

  const handleClearSearch = () => {
    clearSearch();
    reset();
  };

  const handleSelectUser = async (user: User) => {
    startConversation(user.id);
    try {
      const response = await conversationsApi.createConversation(user.id);
      handleClearSearch();
      onConversationCreated(response.conversation);
    } catch {
      resolveError(inviteText.startConversationFailed);
    }
  };

  const handleInvite = async () => {
    if (isInviting || !!remainingTime) return;

    startInvite();
    try {
      const conversation = await conversationsApi.createInvite(query);
      if (conversation.action === "reminder_sent") {
        resolveReminderSent();
      } else if (conversation.action === "created") {
        handleClearSearch();
        onConversationCreated(conversation);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const errorData = error.response.data;
        resolveError(
          errorData.error || inviteText.rateLimitDefault,
          errorData.available_after
            ? new Date(errorData.available_after).getTime()
            : undefined,
        );
      } else {
        resolveError(inviteText.sendInviteFailed);
      }
    }
  };

  const showResults = query.trim().length >= 2;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        compact ? "w-full" : "w-full max-w-sm",
      )}
    >
      <SearchField
        value={query}
        onChange={handleQueryChange}
        onClear={handleClearSearch}
      />

      {showResults && (
        <div className="border-border bg-surface overflow-hidden rounded-lg border">
          {isSearching && (
            <div className="text-text-secondary flex items-center justify-center gap-2 py-6 text-sm">
              <Spinner size="sm" />
              <span>{sharedText.searching}</span>
            </div>
          )}

          {!isSearching && searchError && (
            <p className="px-4 py-4 text-sm text-red-500">{searchError}</p>
          )}

          {createError && (
            <div className="bg-brand/5 border-border border-b px-4 py-3">
              <p className="text-sm text-red-500">{createError}</p>
            </div>
          )}

          {inviteSent && (
            <div className="bg-brand/5 border-border border-b px-4 py-3">
              <p className="text-brand text-sm font-medium">
                {inviteText.invitationSent}
              </p>
            </div>
          )}

          {!isSearching && !searchError && users.length === 0 && (
            <InviteByEmailCta
              query={query}
              isEmail={isEmail}
              isInviting={isInviting}
              inviteSent={inviteSent}
              remainingTime={remainingTime}
              onInvite={handleInvite}
            />
          )}

          {!isSearching && users.length > 0 && (
            <UserResultList
              users={users}
              creatingId={creatingId}
              onSelect={handleSelectUser}
            />
          )}
        </div>
      )}

      {!showResults && (
        <p className="text-text-secondary text-center text-xs">
          {inviteText.typeAtLeastNChars}
        </p>
      )}
    </div>
  );
}
