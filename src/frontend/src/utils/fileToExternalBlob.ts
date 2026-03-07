import { ExternalBlob } from "../backend";

/**
 * Converts a browser File or Blob to an ExternalBlob for backend upload.
 * Optionally wires up progress tracking.
 */
export async function fileToExternalBlob(
  file: File | Blob,
  onProgress?: (percentage: number) => void,
): Promise<ExternalBlob> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  let blob = ExternalBlob.fromBytes(uint8Array);

  if (onProgress) {
    blob = blob.withUploadProgress(onProgress);
  }

  return blob;
}
