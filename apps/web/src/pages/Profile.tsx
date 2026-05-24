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
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorBanner,
  Spinner,
} from "@shared/ui";
import { extractApiError } from "@shared/utils";
import { ArrowLeft, Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth, usePresence } from "@/providers";

/**
 * Profile page — the home for identity-related actions that used to be
 * scattered around the chat shell. Hosts avatar editing (cropper modal),
 * shows the user's identity (name, username, email), and exposes a
 * back-to-chat affordance.
 *
 * Read-only for now. Editing name / username / email is a separate task
 * (the backend allows it via PATCH /api/me/ but the form work hasn't
 * landed yet — keeping the surface minimal until we know exactly which
 * fields make the cut).
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

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
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

        <ErrorBanner message={uploadError} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {sharedText.profilePicture}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <button
              type="button"
              onClick={handlePickFile}
              disabled={isUploading}
              aria-label={sharedText.changePicture}
              className="group focus-visible:ring-ring relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none"
            >
              <Avatar
                name={fullName}
                url={user?.avatar}
                size="lg"
                presence={presence}
                presenceLabel={presenceText[presence]}
              />
              <span
                aria-hidden
                className="bg-brand text-brand-foreground ring-surface absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full opacity-0 ring-2 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Pencil className="h-3 w-3" />
              </span>
              {isUploading && (
                <span
                  aria-hidden
                  className="bg-surface/70 absolute inset-0 flex items-center justify-center rounded-full"
                >
                  <Spinner size="sm" />
                </span>
              )}
            </button>
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePickFile}
                disabled={isUploading}
              >
                {sharedText.changePicture}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {fullName}
              {user?.username && (
                <span className="text-text-secondary ml-2 text-sm font-normal">
                  @{user.username}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReadonlyField
              label={authText.firstName}
              value={user?.first_name}
            />
            <ReadonlyField label={authText.lastName} value={user?.last_name} />
            <ReadonlyField label={authText.username} value={user?.username} />
            <ReadonlyField label={authText.email} value={user?.email} />
          </CardContent>
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
    </div>
  );
}

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-secondary text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-text-primary text-sm">{value || "—"}</span>
    </div>
  );
}
