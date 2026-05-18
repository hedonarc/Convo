import { usersApi } from "@shared/api";
import type { User } from "@shared/types/user";
import { useEffect, useRef, useState } from "react";

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setUsers([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    timerRef.current = setTimeout(async () => {
      try {
        const data = await usersApi.searchUsers(query.trim());
        setUsers(data.results);
      } catch {
        setSearchError("Search failed. Please try again.");
        setUsers([]);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setUsers([]);
    setSearchError(null);
  };

  return { users, isSearching, searchError, query, setQuery, clearSearch };
}
