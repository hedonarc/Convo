import { MAX_MESSAGE_LENGTH } from "@shared/constants";
import { Button } from "@shared/ui";
import { cn } from "@shared/utils";
import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MessageInputProps {
  onSend: (content: string) => void;
  /** Disable when the socket isn't open / send is in flight. */
  disabled?: boolean;
  placeholder?: string;
}

const MAX_HEIGHT_PX = 128; // ≈ 5 lines of text-sm with default line-height

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Type a message…",
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow up to MAX_HEIGHT_PX, then overflow internally.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const trimmed = value.trim();
  const isTooLong = trimmed.length > MAX_MESSAGE_LENGTH;
  const showCounter = trimmed.length > MAX_MESSAGE_LENGTH * 0.8;
  const canSend = trimmed.length > 0 && !isTooLong && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-border bg-surface shrink-0 border-t p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          aria-label="Message"
          aria-invalid={isTooLong || undefined}
          className={cn(
            "border-border bg-input text-text-primary placeholder:text-text-secondary focus-visible:ring-ring flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none",
            isTooLong && "border-red-500 focus-visible:ring-red-500",
          )}
        />
        <Button
          type="button"
          size="icon"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {showCounter && (
        <p
          className={cn(
            "mt-1.5 text-right text-xs",
            isTooLong ? "text-red-500" : "text-text-secondary",
          )}
        >
          {trimmed.length} / {MAX_MESSAGE_LENGTH}
        </p>
      )}
    </div>
  );
}
