import { ROUTES } from "@shared/constants";
import { sharedText } from "@shared/constants/strings/index.en";
import { Button } from "@shared/ui";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * Stub profile page — replaced in the next commit with avatar editing and
 * basic identity fields. Wired now so the UserMenu's "View profile" link has
 * a valid destination.
 */
export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(ROUTES.CHAT)}
        className="gap-2 self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        {sharedText.backToChat}
      </Button>
      <h1 className="text-text-primary text-2xl font-bold tracking-tight">
        {sharedText.profileHeading}
      </h1>
      <p className="text-text-secondary text-sm">Coming up next.</p>
    </div>
  );
}
