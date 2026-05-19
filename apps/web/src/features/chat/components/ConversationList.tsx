import { apiClient } from "@shared/api/client";
import type { Conversation } from "@shared/types/conversation";
import { Avatar, AvatarCropModal, Button } from "@shared/ui";
import { LogOut, MessageSquarePlus, Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "../../../providers/auth.provider";
import { ConversationItem } from "./ConversationItem";
import { NewChatDialog } from "./NewChatDialog";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (conversation: Conversation) => void;
  onConversationCreated: () => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onConversationCreated,
}: ConversationListProps) {
  const { user, setUser, logout } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fullName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    user?.username;

  const handleConversationCreated = () => {
    onConversationCreated();
    setDialogOpen(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const response = await apiClient.patch("/api/me/", formData);

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

  return (
    <>
      <aside className="border-border bg-surface flex h-full w-72 shrink-0 flex-col border-r">
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
            id="new-chat-button"
            aria-label="New conversation"
            onClick={() => setDialogOpen(true)}
            className="text-text-secondary hover:text-brand hover:bg-brand/10 focus-visible:ring-ring flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        </div>

        {/* Conversations */}
        <nav aria-label="Conversations" className="flex-1 overflow-y-auto">
          <ul role="list">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <ConversationItem
                  conversation={conversation}
                  isActive={conversation.id === activeId}
                  onClick={() => onSelect(conversation)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-border border-t p-3">
          <Button
            id="sidebar-logout-button"
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-text-secondary hover:text-text-primary w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <NewChatDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConversationCreated={handleConversationCreated}
      />
      <AvatarCropModal
        open={isCropModalOpen}
        image={selectedImage}
        loading={isUploadingAvatar}
        onClose={() => {
          setIsCropModalOpen(false);

          if (selectedImage) {
            URL.revokeObjectURL(selectedImage);
          }

          setSelectedImage(null);
        }}
        onSave={handleAvatarUpload}
      />
    </>
  );
}
