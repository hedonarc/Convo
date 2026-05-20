import Cropper from "react-easy-crop";
import { useState } from "react";
import { Area, AvatarCropModalProps, createCroppedImage } from "./AvatarCropModal.utils.web";


export function AvatarCropModal({
  open,
  image,
  loading = false,
  onClose,
  onSave,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);

  const onCropComplete = (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    }

  const handleSave = async () => {
    if (!image || !croppedAreaPixels) return;

    try {
      const croppedFile = await createCroppedImage(
        image,
        croppedAreaPixels,
      );

      await onSave(croppedFile);
    } catch (error) {
      console.error("Crop failed:", error);
    }
  };

  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-surface relative flex w-full max-w-md flex-col rounded-2xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-text-primary text-lg font-semibold">
            Crop Avatar
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        {/* Cropper */}
        <div className="relative h-80 w-full bg-black">
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

        {/* Zoom */}
        <div className="px-4 pt-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Footer */}
        <div className="border-border flex items-center justify-end gap-2 border-t px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-text-secondary hover:text-text-primary rounded-lg px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-brand text-white hover:bg-brand/90 rounded-lg px-4 py-2 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}