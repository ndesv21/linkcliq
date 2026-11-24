export async function resizeImage(file: File, size: number, quality = 0.85): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Pick an image file")
  const bitmap = await createImageBitmap(file)
  const scale = size / Math.min(bitmap.width, bitmap.height)
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h)
  const webp = canvas.toDataURL("image/webp", quality)
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", quality)
}
