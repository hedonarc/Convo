import { useState } from "react";

import { usersApi } from "@/shared/api";
import type { User } from "@/shared/types/user";

import { useApiQuery } from "./useApiQuery";
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
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);

  const { data, isLoading, error } = useApiQuery(
    async (signal) =>
      (await usersApi.searchUsers(debouncedQuery, signal)).results,
    [debouncedQuery],
    {
      initial: [] as User[],
      enabled: debouncedQuery.length >= MIN_QUERY_LENGTH,
      errorMessage: "Search failed. Please try again.",
    },
  );

  const clearSearch = () => setQuery("");

  return {
    users: data,
    isSearching: isLoading,
    searchError: error,
    query,
    setQuery,
    clearSearch,
  };
}
