import { useState } from "react";
import Cropper from "react-easy-crop";

import { Button } from "../Button";
import { ErrorBanner } from "../ErrorBanner";
import { Label } from "../Label";
import { Modal, ModalFooter, ModalHeader } from "../Modal";
import { Slider } from "../Slider";
import { Spinner } from "../Spinner";
import {
  type Area,
  type AvatarCropModalProps,
  createCroppedImage,
} from "./AvatarCropModal.utils.web";

export function AvatarCropModal({
  open,
  image,
  loading = false,
  error = null,
  onClose,
  onSave,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [internalError, setInternalError] = useState<string | null>(null);

  const onCropComplete = (_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSave = async () => {
    if (!image || !croppedAreaPixels) return;

    setInternalError(null);
    try {
      const croppedFile = await createCroppedImage(image, croppedAreaPixels);
      await onSave(croppedFile);
    } catch {
      setInternalError("Couldn't crop the image. Please try again.");
    }
  };

  if (!image) return null;

  const displayedError = internalError ?? error;

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Crop your photo">
      <ModalHeader onClose={onClose}>Crop your photo</ModalHeader>

      <div className="flex flex-col gap-4 p-6">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black/90">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="avatar-crop-zoom"
            className="text-text-secondary text-xs"
          >
            Zoom
          </Label>
          <Slider
            id="avatar-crop-zoom"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <p className="text-text-secondary text-xs">
            Drag to reposition · scroll or use the slider to zoom
          </p>
        </div>

        <ErrorBanner message={displayedError} />
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading || !croppedAreaPixels}>
          {loading ? (
            <>
              <Spinner
                size="sm"
                className="border-brand-foreground/40 border-t-brand-foreground"
              />
              Saving…
            </>
          ) : (
            "Save photo"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
