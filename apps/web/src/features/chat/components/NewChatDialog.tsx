import type { Conversation } from "@shared/types/conversation";
import { Modal, ModalHeader } from "@shared/ui";

import { UserSearchPanel } from "./UserSearchPanel";

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export function NewChatDialog({
  open,
  onClose,
  onConversationCreated,
}: NewChatDialogProps) {
  const handleCreated = (conversation: Conversation) => {
    onConversationCreated(conversation);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Start a new conversation">
      <ModalHeader onClose={onClose}>New conversation</ModalHeader>
      <div className="p-6">
        <UserSearchPanel onConversationCreated={handleCreated} compact />
      </div>
    </Modal>
  );
}
