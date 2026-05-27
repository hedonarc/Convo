import { MAX_MESSAGE_LENGTH } from "@shared/constants";
import { sharedText } from "@shared/constants/strings/index.en";
import { Button } from "@shared/ui";
import { cn } from "@shared/utils";
import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MessageInputProps {
  onSend: (content: string) => void;
  /** Disable when the socket isn't open / send is in flight. */
  disabled?: boolean;
  placeholder?: string;
  /** Fires on each non-trivial keystroke; used to emit throttled typing pings. */
  onTyping?: () => void;
  /**
   * Refocus the textarea whenever this value changes. Pass the active
   * conversation id from the parent so the composer auto-focuses on
   * conversation switch — `autoFocus` alone only fires on mount, and the
   * MessagePane is mounted once across the whole session now.
   */
  focusKey?: number | string;
}

const MAX_HEIGHT_PX = 128; // ≈ 5 lines of text-sm with default line-height

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = sharedText.messageInputPlaceholder,
  onTyping,
  focusKey,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow up to MAX_HEIGHT_PX, then overflow internally. Also toggle
  // overflow-y manually: Chrome shows a ghost vertical scrollbar on textareas
  // even when content fits (intrinsic UA styles + box-model rounding), which
  // makes the composer look broken. Keep overflow hidden while we're under
  // the cap; only switch to auto when the user has actually written past it.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, MAX_HEIGHT_PX);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [value]);

  // Auto-focus on mount and on every conversation switch. Replaces the
  // `autoFocus` attribute — that only fires on mount, which used to be
  // "once per conversation" but now (with MessagePane held mounted across
  // switches) is "once per session". Pure ref method, not setState, so it
  // can live in the effect body.
  useEffect(() => {
    textareaRef.current?.focus();
  }, [focusKey]);

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
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value.length > 0) onTyping?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          aria-label={sharedText.messageInputLabel}
          aria-invalid={isTooLong || undefined}
          className={cn(
            "border-border bg-input text-text-primary placeholder:text-text-secondary focus-visible:ring-ring no-scrollbar flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none",
            isTooLong && "border-red-500 focus-visible:ring-red-500",
          )}
        />
        <Button
          type="button"
          size="icon"
          onClick={submit}
          disabled={!canSend}
          aria-label={sharedText.sendMessageAriaLabel}
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
