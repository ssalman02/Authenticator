import { BrowserQRCodeReader } from "@zxing/browser";

const reader = new BrowserQRCodeReader();

export async function scanQRCodeImage(file) {
  if (!file || !file.type.startsWith("image/")) throw new Error("Please select a valid image.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Image must be smaller than 12 MB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();
    const result = await reader.decodeFromImageElement(image);
    return result.getText();
  } catch (error) {
    if (error?.name === "NotFoundException") {
      throw new Error("No QR code found. Use a clear image with the full QR code visible.");
    }
    throw new Error(error?.message || "Unable to decode QR image.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}