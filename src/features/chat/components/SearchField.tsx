import { Search, X } from "lucide-react";

import { sharedText } from "@/shared/constants/strings/index.en";
import { Input } from "@/shared/ui";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchField({ value, onChange, onClear }: SearchFieldProps) {
  return (
    <div className="relative">
      <Search className="text-text-secondary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        id="user-search-input"
        type="text"
        placeholder={sharedText.searchPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-9 pl-9"
        autoComplete="off"
        autoFocus
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label={sharedText.clearSearchAriaLabel}
          className="text-text-secondary hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
