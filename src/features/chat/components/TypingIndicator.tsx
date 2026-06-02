import type { User } from "@/shared/types/user";

interface TypingIndicatorProps {
  typingUserIds: number[];
  participants: User[];
}

function labelFor(user: User | undefined): string {
  if (!user) return "Someone";
  return user.first_name || user.username;
}

export function TypingIndicator({
  typingUserIds,
  participants,
}: TypingIndicatorProps) {
  if (typingUserIds.length === 0) return null;

  const byId = new Map(participants.map((p) => [p.id, p]));
  const names = typingUserIds.map((id) => labelFor(byId.get(id)));

  let label: string;
  if (names.length === 1) {
    label = `${names[0]} is typing`;
  } else if (names.length === 2) {
    label = `${names[0]} and ${names[1]} are typing`;
  } else {
    label = `${names.length} people are typing`;
  }

  return (
    <div
      aria-live="polite"
      className="text-text-secondary flex items-center gap-2 px-4 py-1 text-xs"
    >
      <span className="bg-text-secondary/50 inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
      <span className="bg-text-secondary/50 inline-block h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:120ms]" />
      <span className="bg-text-secondary/50 inline-block h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:240ms]" />
      <span>{label}…</span>
    </div>
  );
}
