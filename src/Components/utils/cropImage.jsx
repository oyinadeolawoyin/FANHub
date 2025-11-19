// src/utils/cropImage.js
export default function getCroppedImg(imageSrc, pixelCrop) {
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = imageSrc;

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(
        img,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    };
    img.onerror = () => reject(new Error("Image load failed"));
  });
}