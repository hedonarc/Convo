import { usersApi } from "@shared/api";
import { ROUTES } from "@shared/constants";
import {
  authText,
  errorText,
  presenceText,
  sharedText,
} from "@shared/constants/strings/index.en";
import {
  Avatar,
  AvatarCropModal,
  AvatarZoomModal,
  Button,
  Card,
  CardContent,
  ErrorBanner,
  Spinner,
} from "@shared/ui";
import { cn, extractApiError } from "@shared/utils";
import { ArrowLeft, Camera } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth, usePresence } from "@/providers";

const PRESENCE_PILL_STYLES = {
  online: "bg-green-500/10 text-green-700 dark:text-green-400",
  away: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  offline: "bg-gray-400/10 text-text-secondary",
} as const;

const PRESENCE_DOT_STYLES = {
  online: "bg-green-500 dark:bg-green-400",
  away: "bg-yellow-500 dark:bg-yellow-400",
  offline: "bg-gray-400 dark:bg-gray-500",
} as const;

/**
 * Profile page — the home for identity. Reorganized to lead with the user
 * (avatar + name + presence) and demote details to a supporting section,
 * rather than treating the page as a settings form. Field editing isn't
 * shipped yet; we surface that explicitly via a disabled "Edit profile"
 * affordance so the read-only state is intentional, not mysterious.
 */
export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const presence = usePresence(user?.id);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.username ||
    sharedText.youFallback;

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setSelectedImage(URL.createObjectURL(file));
    setIsCropOpen(true);
    e.target.value = "";
  };

  const handleUpload = async (croppedFile: File) => {
    if (!user) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", croppedFile);
      const updated = await usersApi.updateMe(formData);
      setUser(updated);
      closeCrop();
    } catch (err) {
      setUploadError(extractApiError(err, errorText.uploadAvatarFailed));
    } finally {
      setIsUploading(false);
    }
  };

  const closeCrop = () => {
    setIsCropOpen(false);
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
    setUploadError(null);
  };

  // "Member since" — relies on the new `date_joined` field added to
  // UserSerializer. Format as month + year (e.g. "May 2026") since the
  // exact day rarely matters at the profile-page glance.
  const memberSinceLabel = formatMemberSince(user?.date_joined);

  // Decide which fields belong in the details section. Username and email
  // are always required (backend invariants), so they always render with a
  // value. First/last name are optional — we show them with a soft
  // "Not set" placeholder so the user knows they exist as fields.
  const fields: Array<{ label: string; value?: string | null }> = [
    { label: authText.firstName, value: user?.first_name },
    { label: authText.lastName, value: user?.last_name },
    { label: authText.username, value: user?.username },
    { label: authText.email, value: user?.email },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-8 sm:py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.CHAT)}
          className="gap-2 self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          {sharedText.backToChat}
        </Button>

        <ErrorBanner message={uploadError} />

        <Card>
          <CardContent className="flex flex-col items-center gap-5 pt-8 pb-6">
            {/* ── Hero: avatar with hover-to-change overlay ──────────────── */}
            <div className="group/avatar relative">
              <button
                type="button"
                onClick={() => user?.avatar && setIsZoomOpen(true)}
                disabled={!user?.avatar || isUploading}
                aria-label={sharedText.zoomAvatarAriaLabel}
                className={cn(
                  "focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                  user?.avatar && !isUploading && "cursor-zoom-in",
                  !user?.avatar && "cursor-default",
                )}
              >
                <Avatar name={fullName} url={user?.avatar} size="xl" />
                {isUploading && (
                  <span
                    role="status"
                    aria-label={sharedText.changePictureAriaLabel}
                    className="bg-surface/70 absolute inset-0 flex items-center justify-center rounded-full"
                  >
                    <Spinner size="sm" />
                  </span>
                )}
              </button>

              {/* Camera overlay button — lives on top of the avatar. On
                  hover/focus it fades in; on mobile (no hover) it stays
                  visible at reduced opacity so the affordance isn't
                  hidden behind a state that touch devices can't trigger. */}
              <button
                type="button"
                onClick={handlePickFile}
                disabled={isUploading}
                aria-label={sharedText.changePictureAriaLabel}
                className={cn(
                  "border-border bg-surface text-text-primary hover:bg-brand hover:text-brand-foreground focus-visible:ring-ring absolute right-0 bottom-0 flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                  "opacity-100 sm:opacity-0 sm:group-hover/avatar:opacity-100 sm:focus-within:opacity-100",
                )}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* ── Identity block ─────────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-text-primary text-2xl font-bold tracking-tight sm:text-3xl">
                {fullName}
              </h1>
              <div className="flex items-center gap-2">
                {user?.username && (
                  <p className="text-text-secondary text-sm">
                    @{user.username}
                  </p>
                )}
                <PresencePill
                  status={presence}
                  label={presenceText[presence]}
                />
              </div>
              {memberSinceLabel && (
                <p className="text-text-secondary text-xs">
                  {sharedText.memberSince} {memberSinceLabel}
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </CardContent>

          {/* ── Details section ──────────────────────────────────────────── */}
          <div className="border-border border-t">
            <CardContent className="flex flex-col gap-5 py-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                {fields.map((field) => (
                  <ReadonlyField
                    key={field.label}
                    label={field.label}
                    value={field.value}
                  />
                ))}
              </div>

              {/* Disabled edit affordance — signals "this isn't broken,
                  it's intentionally locked, and editing is coming." */}
              <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p className="text-text-secondary text-xs">
                  {sharedText.editProfileComingSoon}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="gap-2"
                >
                  {sharedText.editProfile}
                  <span className="bg-brand/10 text-brand rounded-full px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                    {sharedText.comingSoon}
                  </span>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      <AvatarCropModal
        open={isCropOpen}
        image={selectedImage}
        loading={isUploading}
        error={uploadError}
        onClose={closeCrop}
        onSave={handleUpload}
      />

      <AvatarZoomModal
        open={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        url={user?.avatar}
        name={fullName}
        ariaLabel={sharedText.avatarZoomDialogLabel}
      />
    </div>
  );
}

function PresencePill({
  status,
  label,
}: {
  status: keyof typeof PRESENCE_PILL_STYLES;
  label: string;
}) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        PRESENCE_PILL_STYLES[status],
      )}
    >
      <span
        aria-hidden
        className={cn("h-1.5 w-1.5 rounded-full", PRESENCE_DOT_STYLES[status])}
      />
      {label}
    </span>
  );
}

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const isEmpty = !value;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-secondary text-[11px] font-medium tracking-wider uppercase">
        {label}
      </span>
      <span
        className={cn(
          "text-sm",
          isEmpty ? "text-text-secondary italic" : "text-text-primary",
        )}
      >
        {value || sharedText.notSet}
      </span>
    </div>
  );
}

function formatMemberSince(isoDate: string | undefined): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}
