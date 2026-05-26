import { sharedText } from "@shared/constants/strings/index.en";
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
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={sharedText.newConversationDialogLabel}
    >
      <ModalHeader onClose={onClose}>
        {sharedText.newConversationTitle}
      </ModalHeader>
      <div className="p-6">
        <UserSearchPanel onConversationCreated={handleCreated} compact />
      </div>
    </Modal>
  );
}
