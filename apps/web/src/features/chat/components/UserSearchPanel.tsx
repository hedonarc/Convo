import { conversationsApi } from "@shared/api";
import type { User } from "@shared/types/user";
import { Avatar, Input, Spinner } from "@shared/ui";
import { cn } from "@shared/utils";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { useUserSearch } from "../hooks/useUserSearch";

interface UserSearchPanelProps {
  onConversationCreated: () => void;
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

  const handleSelectUser = async (user: User) => {
    setCreating(user.id);
    setCreateError(null);
    try {
      await conversationsApi.createConversation(user.id);
      clearSearch();
      onConversationCreated();
    } catch {
      setCreateError("Couldn't start a conversation. Please try again.");
    } finally {
      setCreating(null);
    }
  };

  const showResults = query.trim().length >= 2;

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        compact ? "w-full" : "w-full max-w-sm",
      )}
    >
      {/* Search input */}
      <div className="relative">
        <Search className="text-text-secondary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          id="user-search-input"
          type="text"
          placeholder="Search by username or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-9 pl-9"
          autoComplete="off"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="text-text-secondary hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results area */}
      {showResults && (
        <div className="border-border bg-surface overflow-hidden rounded-lg border">
          {/* Searching spinner */}
          {isSearching && (
            <div className="text-text-secondary flex items-center justify-center gap-2 py-6 text-sm">
              <Spinner size="sm" />
              <span>Searching…</span>
            </div>
          )}

          {/* Search error */}
          {!isSearching && searchError && (
            <p className="px-4 py-4 text-sm text-red-500">{searchError}</p>
          )}

          {/* Create error */}
          {createError && (
            <p className="px-4 pt-3 text-sm text-red-500">{createError}</p>
          )}

          {/* No results */}
          {!isSearching && !searchError && users.length === 0 && (
            <div className="text-text-secondary flex flex-col items-center gap-1 py-6">
              <p className="text-sm font-medium">No user found</p>
              <p className="text-xs">Try a different username or email</p>
            </div>
          )}

          {/* Results list */}
          {!isSearching && users.length > 0 && (
            <ul role="list">
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    id={`user-result-${user.id}`}
                    disabled={creating === user.id}
                    onClick={() => handleSelectUser(user)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      "hover:bg-brand/5 focus-visible:bg-brand/5 focus-visible:outline-none",
                      "disabled:pointer-events-none disabled:opacity-50",
                      "border-border border-b last:border-0",
                    )}
                  >
                    <Avatar
                      name={
                        `${user.first_name} ${user.last_name}`.trim() ||
                        user.username
                      }
                      size="default"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary truncate text-sm font-medium">
                        {user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`.trim()
                          : user.username}
                      </p>
                      <p className="text-text-secondary truncate text-xs">
                        @{user.username}
                      </p>
                    </div>
                    {creating === user.id && <Spinner size="sm" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Prompt before typing */}
      {!showResults && (
        <p className="text-text-secondary text-center text-xs">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}
