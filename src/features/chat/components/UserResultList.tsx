import type { User } from "@/shared/types/user";
import { Avatar, Spinner } from "@/shared/ui";
import { cn } from "@/shared/utils";

interface UserResultItemProps {
  user: User;
  isCreating: boolean;
  onSelect: (user: User) => void;
}

function UserResultItem({ user, isCreating, onSelect }: UserResultItemProps) {
  const fullName = `${user.first_name} ${user.last_name}`.trim();

  return (
    <li>
      <button
        type="button"
        id={`user-result-${user.id}`}
        disabled={isCreating}
        onClick={() => onSelect(user)}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
          "hover:bg-brand/5 focus-visible:bg-brand/5 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          "border-border border-b last:border-0",
        )}
      >
        <Avatar
          name={fullName || user.username}
          size="default"
          url={user.avatar}
        />
        <div className="min-w-0 flex-1">
          <p className="text-text-primary truncate text-sm font-medium">
            {fullName || user.username}
          </p>
          <p className="text-text-secondary truncate text-xs">
            @{user.username}
          </p>
        </div>
        {isCreating && <Spinner size="sm" />}
      </button>
    </li>
  );
}

interface UserResultListProps {
  users: User[];
  creatingId: number | null;
  onSelect: (user: User) => void;
}

export function UserResultList({
  users,
  creatingId,
  onSelect,
}: UserResultListProps) {
  return (
    <ul role="list">
      {users.map((user) => (
        <UserResultItem
          key={user.id}
          user={user}
          isCreating={creatingId === user.id}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
