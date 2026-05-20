import { Avatar, AvatarCropModal } from "@shared/ui";
import { MessageSquarePlus, Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { apiClient } from "@shared/api/client";
import { API_ENDPOINTS } from "@shared/constants";

import type { User } from "@shared/types/user";

interface ConversationListHeaderProps {
  user: User | null;
  setUser: (user: User) => void;
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setSelectedImage(imageUrl);
    setIsCropModalOpen(true);

    e.target.value = "";
  };

  const handleAvatarUpload = async (croppedFile: File) => {
    if (!user) return;

    try {
      setIsUploadingAvatar(true);

      const formData = new FormData();
      formData.append("avatar", croppedFile);

      const response = await apiClient.patch(API_ENDPOINTS.ME, formData);

      setUser(response.data);

      setIsCropModalOpen(false);

      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }

      setSelectedImage(null);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCloseCropModal = () => {
    setIsCropModalOpen(false);

    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    setSelectedImage(null);
  };

  return (
    <>
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="group relative">
            <Avatar name={fullName} url={user?.avatar} size="default" />

            <button
              type="button"
              aria-label="Edit avatar"
              disabled={isUploadingAvatar}
              onClick={handleAvatarClick}
              className="absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-100"
            >
              <Pencil className="h-3 w-3" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-text-primary text-base font-semibold">
              Messages
            </h2>

            {user && (
              <p className="text-text-secondary mt-0.5 text-xs">
                @{user.username}
              </p>
            )}
          </div>
        </div>

        {/* New Chat */}
        <button
          type="button"
          aria-label="New conversation"
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
        onClose={handleCloseCropModal}
        onSave={handleAvatarUpload}
      />
    </>
  );
}
