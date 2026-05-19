import { Input } from "@shared/ui";
import { Search, X } from "lucide-react";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchField({ value, onChange, onClear }: SearchFieldProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
      <Input
        id="user-search-input"
        type="text"
        placeholder="Search by username or email…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
        autoComplete="off"
        autoFocus
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
