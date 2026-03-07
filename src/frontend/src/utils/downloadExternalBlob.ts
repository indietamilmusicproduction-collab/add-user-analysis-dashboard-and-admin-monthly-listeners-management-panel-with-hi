/**
 * Downloads an ExternalBlob with a specified filename.
 * Fetches the blob bytes and triggers a browser download.
 */
export async function downloadExternalBlob(
  blob: { getBytes: () => Promise<Uint8Array> },
  filename: string,
): Promise<void> {
  try {
    // Fetch the bytes from the ExternalBlob
    const bytes = await blob.getBytes();

    // Create a Blob from the bytes - convert to regular array to avoid type issues
    const fileBlob = new Blob([new Uint8Array(bytes)]);

    // Create an object URL
    const url = URL.createObjectURL(fileBlob);

    // Create a temporary anchor element and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    throw new Error("Failed to download file");
  }
}
