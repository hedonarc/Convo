import type { User } from "@shared/types/user";
import { Avatar, Spinner } from "@shared/ui";
import { cn } from "@shared/utils";

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
          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
          "hover:bg-brand/5 focus-visible:outline-none focus-visible:bg-brand/5",
          "disabled:opacity-50 disabled:pointer-events-none",
          "border-b border-border last:border-0",
        )}
      >
        <Avatar name={fullName || user.username} size="default" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {fullName || user.username}
          </p>
          <p className="text-xs text-text-secondary truncate">
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
