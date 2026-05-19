import { usersApi } from "@shared/api";
import type { User } from "@shared/types/user";
import { useEffect, useState } from "react";

import { useDebouncedValue } from "./useDebouncedValue";

interface UseUserSearchResult {
  users: User[];
  isSearching: boolean;
  searchError: string | null;
  query: string;
  setQuery: (q: string) => void;
  clearSearch: () => void;
}

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;

export function useUserSearch(): UseUserSearchResult {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) return;

    let cancelled = false;
    const run = async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const data = await usersApi.searchUsers(debouncedQuery);
        if (!cancelled) setUsers(data.results);
      } catch {
        if (!cancelled) {
          setSearchError("Search failed. Please try again.");
          setUsers([]);
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const shortQuery = query.trim().length < MIN_QUERY_LENGTH;
  const clearSearch = () => setQuery("");

  return {
    users: shortQuery ? [] : users,
    isSearching: shortQuery ? false : isSearching,
    searchError: shortQuery ? null : searchError,
    query,
    setQuery,
    clearSearch,
  };
}
