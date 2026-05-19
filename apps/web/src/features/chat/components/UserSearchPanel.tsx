import { conversationsApi } from "@shared/api";
import type { Conversation } from "@shared/types/conversation";
import type { User } from "@shared/types/user";
import { Spinner } from "@shared/ui";
import { cn } from "@shared/utils";
import axios from "axios";
import { useState } from "react";

import { useCountdown } from "../hooks/useCountdown";
import { useUserSearch } from "../hooks/useUserSearch";
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
  const [creating, setCreating] = useState<number | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<"idle" | "reminder_sent">(
    "idle",
  );

  const [availableAfterMs, setAvailableAfterMs] = useState<number | null>(null);
  const remainingTime = useCountdown(availableAfterMs, 1000);

  const resetInviteState = () => {
    setCreateError(null);
    setInviteStatus("idle");
    setAvailableAfterMs(null);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    resetInviteState();
  };

  const handleClearSearch = () => {
    clearSearch();
    resetInviteState();
  };

  const handleSelectUser = async (user: User) => {
    setCreating(user.id);
    setCreateError(null);
    setInviteStatus("idle");
    try {
      const response = await conversationsApi.createConversation(user.id);
      handleClearSearch();
      onConversationCreated(response.conversation);
    } catch {
      setCreateError("Couldn't start a conversation. Please try again.");
    } finally {
      setCreating(null);
    }
  };

  const handleInvite = async () => {
    if (creating === -1 || !!remainingTime) return;

    // -1 = invite-by-email in flight (no real user id to key off)
    setCreating(-1);
    setCreateError(null);
    setInviteStatus("idle");
    try {
      const conversation = await conversationsApi.createInvite(query);
      if (conversation.action === "reminder_sent") {
        setInviteStatus("reminder_sent");
      } else if (conversation.action === "created") {
        handleClearSearch();
        onConversationCreated(conversation);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const errorData = error.response.data;
        setCreateError(
          errorData.error || "You can only send one invite every 24 hours.",
        );

        if (errorData.available_after) {
          setAvailableAfterMs(new Date(errorData.available_after).getTime());
        }
      } else {
        setCreateError("Couldn't send invite. Please try again.");
      }
    } finally {
      setCreating(null);
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
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          {isSearching && (
            <div className="flex items-center justify-center gap-2 py-6 text-text-secondary text-sm">
              <Spinner size="sm" />
              <span>Searching…</span>
            </div>
          )}

          {!isSearching && searchError && (
            <p className="py-4 px-4 text-sm text-red-500">{searchError}</p>
          )}

          {createError && (
            <div className="px-4 py-3 bg-brand/5 border-b border-border">
              <p className="text-sm text-red-500">{createError}</p>
            </div>
          )}

          {inviteStatus === "reminder_sent" && (
            <div className="px-4 py-3 bg-brand/5 border-b border-border">
              <p className="text-sm font-medium text-brand">
                Invitation sent!
              </p>
            </div>
          )}

          {!isSearching && !searchError && users.length === 0 && (
            <InviteByEmailCta
              query={query}
              isEmail={isEmail}
              isInviting={creating === -1}
              inviteSent={inviteStatus === "reminder_sent"}
              remainingTime={remainingTime}
              onInvite={handleInvite}
            />
          )}

          {!isSearching && users.length > 0 && (
            <UserResultList
              users={users}
              creatingId={creating}
              onSelect={handleSelectUser}
            />
          )}
        </div>
      )}

      {!showResults && (
        <p className="text-xs text-text-secondary text-center">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}
