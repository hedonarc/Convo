export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface AvatarCropModalProps {
  open: boolean;
  image: string | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));

    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

export async function createCroppedImage(
  imageSrc: string,
  crop: Area,
): Promise<File> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not found");
  }

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create blob"));
        return;
      }

      const file = new File([blob], "avatar.jpg", {
        type: "image/jpeg",
      });

      resolve(file);
    }, "image/jpeg");
  });
}