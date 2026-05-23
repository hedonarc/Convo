import { usersApi } from "@shared/api";
import {
  dashboardText,
  errorText,
  sharedText,
} from "@shared/constants/strings/index.en";
import type { User } from "@shared/types/user";
import { Avatar, AvatarCropModal, Spinner } from "@shared/ui";
import { extractApiError } from "@shared/utils";
import { MessageSquarePlus, Pencil } from "lucide-react";
import { useRef, useState } from "react";

interface ConversationListHeaderProps {
  user: User | null;
  setUser: (user: User | null) => void;
  fullName?: string;
  onNewChat: () => void;
}

export function ConversationListHeader({
  user,
  setUser,
  fullName,
  onNewChat,
}: ConversationListHeaderProps) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setSelectedImage(URL.createObjectURL(file));
    setIsCropModalOpen(true);

    e.target.value = "";
  };

  const handleAvatarUpload = async (croppedFile: File) => {
    if (!user) return;

    setUploadError(null);
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", croppedFile);
      const updated = await usersApi.updateMe(formData);
      setUser(updated);
      closeCropModal();
    } catch (err) {
      setUploadError(extractApiError(err, errorText.uploadAvatarFailed));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const closeCropModal = () => {
    setIsCropModalOpen(false);
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
    setUploadError(null);
  };

  return (
    <>
      <div className="border-border flex items-center justify-between border-b px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* Avatar — whole tile is the click target for editing. */}
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={isUploadingAvatar}
            aria-label={sharedText.editAvatarAriaLabel}
            className="group focus-visible:ring-ring relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none"
          >
            <Avatar name={fullName} url={user?.avatar} size="default" />

            {/* Brand-coloured pencil badge — sits on the bottom-right corner. */}
            <span
              aria-hidden
              className="bg-brand text-brand-foreground ring-surface absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full opacity-0 ring-2 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <Pencil className="h-2.5 w-2.5" />
            </span>

            {/* Busy overlay while uploading. */}
            {isUploadingAvatar && (
              <span
                aria-hidden
                className="bg-surface/70 absolute inset-0 flex items-center justify-center rounded-full"
              >
                <Spinner size="sm" />
              </span>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="min-w-0">
            <h2 className="text-text-primary text-base font-semibold">
              {dashboardText.messagesHeading}
            </h2>
            {user && (
              <p className="text-text-secondary mt-0.5 truncate text-xs">
                @{user.username}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label={sharedText.newConversationAriaLabel}
          onClick={onNewChat}
          className="text-text-secondary hover:text-brand hover:bg-brand/10 focus-visible:ring-ring flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          <MessageSquarePlus className="h-4 w-4" />
        </button>
      </div>

      <AvatarCropModal
        open={isCropModalOpen}
        image={selectedImage}
        loading={isUploadingAvatar}
        error={uploadError}
        onClose={closeCropModal}
        onSave={handleAvatarUpload}
      />
    </>
  );
}
