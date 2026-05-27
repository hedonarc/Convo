import { presenceText, sharedText } from "@shared/constants/strings/index.en";
import type { User } from "@shared/types/user";
import { Avatar } from "@shared/ui";
import { cn } from "@shared/utils";
import { ChevronDown, MessageSquarePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { usePresence } from "@/providers";

import { UserMenu } from "./UserMenu";

interface ConversationListHeaderProps {
  user: User | null;
  fullName?: string;
  onNewChat: () => void;
}

/**
 * Sidebar header: the user's identity tile (avatar + name + @handle) on the
 * left and a new-chat button on the right. Clicking the identity tile
 * expands the header in-place to reveal the account menu (status, profile,
 * theme, sign out) — no floating popover, the header surface itself grows.
 *
 * Open state lives here (not inside UserMenu) so the wrapping `<div>` —
 * the surface the user perceives as expanding — can lay out around it.
 */
export function ConversationListHeader({
  user,
  fullName,
  onNewChat,
}: ConversationListHeaderProps) {
  const ownStatus = usePresence(user?.id);
  const displayName = fullName ?? user?.username ?? sharedText.youFallback;

  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Dismiss the panel when the user interacts outside it. Mousedown (not
  // click) so the panel closes before any click handler runs on the target
  // — e.g. clicking a conversation immediately switches view without a
  // perceptible "menu collapses, then nav happens" sequence.
  useEffect(() => {
    if (!menuOpen) return;
    const handlePointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  return (
    <div className="border-border flex flex-col border-b">
      <div className="flex items-center justify-between px-3 py-3">
        <button
          id="user-menu-trigger"
          ref={triggerRef}
          type="button"
          aria-label={sharedText.userMenuAriaLabel}
          aria-expanded={menuOpen}
          aria-controls="user-menu-panel"
          onClick={() => setMenuOpen((o) => !o)}
          className="hover:bg-brand/5 focus-visible:ring-ring aria-expanded:bg-brand/5 -mx-1 flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          <Avatar
            name={fullName}
            url={user?.avatar}
            size="default"
            presence={ownStatus}
            presenceLabel={presenceText[ownStatus]}
          />
          <div className="min-w-0 flex-1">
            <p className="text-text-primary truncate text-sm font-semibold">
              {displayName}
            </p>
            {user?.username && (
              <p className="text-text-secondary truncate text-xs">
                @{user.username}
              </p>
            )}
          </div>
          <ChevronDown
            aria-hidden
            className={cn(
              "text-text-secondary h-4 w-4 shrink-0 transition-transform duration-200",
              menuOpen && "rotate-180",
            )}
          />
        </button>

        <button
          type="button"
          aria-label={sharedText.newConversationAriaLabel}
          onClick={onNewChat}
          className="text-text-secondary hover:text-brand hover:bg-brand/10 focus-visible:ring-ring ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </button>
      </div>

      <div id="user-menu-panel" ref={panelRef} className="px-4">
        <UserMenu
          userId={user?.id}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    </div>
  );
}
