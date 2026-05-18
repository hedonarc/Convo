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
    <div className={cn("flex flex-col gap-3", compact ? "w-full" : "w-full max-w-sm")}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
        <Input
          id="user-search-input"
          type="text"
          placeholder="Search by username or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9"
          autoComplete="off"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results area */}
      {showResults && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          {/* Searching spinner */}
          {isSearching && (
            <div className="flex items-center justify-center gap-2 py-6 text-text-secondary text-sm">
              <Spinner size="sm" />
              <span>Searching…</span>
            </div>
          )}

          {/* Search error */}
          {!isSearching && searchError && (
            <p className="py-4 px-4 text-sm text-red-500">{searchError}</p>
          )}

          {/* Create error */}
          {createError && (
            <p className="px-4 pt-3 text-sm text-red-500">{createError}</p>
          )}

          {/* No results */}
          {!isSearching && !searchError && users.length === 0 && (
            <div className="flex flex-col items-center gap-1 py-6 text-text-secondary">
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
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      "hover:bg-brand/5 focus-visible:outline-none focus-visible:bg-brand/5",
                      "disabled:opacity-50 disabled:pointer-events-none",
                      "border-b border-border last:border-0",
                    )}
                  >
                    <Avatar
                      name={`${user.first_name} ${user.last_name}`.trim() || user.username}
                      size="default"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`.trim()
                          : user.username}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
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
        <p className="text-xs text-text-secondary text-center">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}
