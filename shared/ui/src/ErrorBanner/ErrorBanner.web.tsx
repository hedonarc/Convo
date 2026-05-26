import { cn } from "@shared/utils";

export interface ErrorBannerProps {
  message?: string | null;
  className?: string;
}

const ErrorBanner = ({ message, className }: ErrorBannerProps) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/10 dark:text-red-400",
        className,
      )}
    >
      {message}
    </div>
  );
};
ErrorBanner.displayName = "ErrorBanner";

export { ErrorBanner };
