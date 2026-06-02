import * as React from "react";

import { cn } from "@/shared/utils";

import { Modal } from "../Modal";

export interface AvatarZoomModalProps {
  open: boolean;
  onClose: () => void;
  /** The full-resolution image URL. When absent, the modal won't open. */
  url?: string | null;
  /** Used for the accessible name on the img. */
  name?: string;
  /** Accessible label for the dialog itself. */
  ariaLabel: string;
}

/**
 * Lightweight zoom view for avatars. Reuses the project Modal for backdrop,
 * ESC and click-outside, but strips its chrome so the image floats on top
 * of the blurred backdrop with no card framing.
 *
 * Renders nothing when `url` is empty — callers don't have to guard the
 * trigger; passing `url={undefined}` keeps the modal closed.
 */
export function AvatarZoomModal({
  open,
  onClose,
  url,
  name,
  ariaLabel,
}: AvatarZoomModalProps) {
  if (!url) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={ariaLabel}
      // Strip the card chrome — we just want the image floating over the
      // blurred backdrop, sized to fit the viewport.
      className="w-auto max-w-none border-0 bg-transparent shadow-none"
    >
      <img
        src={url}
        alt={name ?? ""}
        className={cn(
          "block max-h-[80vh] max-w-[80vw] rounded-lg object-contain shadow-2xl",
          "mx-auto",
        )}
      />
    </Modal>
  );
}
