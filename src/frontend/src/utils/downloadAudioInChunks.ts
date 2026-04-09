/**
 * Downloads a large audio file using HTTP range requests (2 MB chunks).
 * Falls back to a single fetch() if range requests aren't supported.
 *
 * @param directURL   - The full URL to the audio file (ExternalBlob.directURL)
 * @param filename    - The filename to use when saving the download
 * @param onProgress  - Optional callback: (receivedBytes, totalBytes) → void
 */

const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5 MB — use chunking above this

export async function downloadAudioInChunks(
  directURL: string,
  filename: string,
  onProgress?: (received: number, total: number) => void,
): Promise<void> {
  // ── Step 1: HEAD request to find Content-Length ──
  let contentLength: number | null = null;
  try {
    const headRes = await fetch(directURL, { method: "HEAD" });
    const cl = headRes.headers.get("Content-Length");
    if (cl) contentLength = Number.parseInt(cl, 10);
  } catch {
    // HEAD not supported — fall through to single fetch
  }

  // ── Step 2: Range-request path ──
  if (contentLength !== null && contentLength > LARGE_FILE_THRESHOLD) {
    const chunks: ArrayBuffer[] = [];
    let received = 0;
    let chunkIndex = 0;
    let rangeSupported = true;

    while (received < contentLength) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE - 1, contentLength - 1);

      try {
        const res = await fetch(directURL, {
          headers: { Range: `bytes=${start}-${end}` },
        });

        // 206 = Partial Content (range supported); 200 = server ignored Range header
        if (res.status === 200 && chunkIndex > 0) {
          // Server doesn't honour Range — fall back to single fetch
          rangeSupported = false;
          break;
        }

        const buffer = await res.arrayBuffer();
        chunks.push(buffer);
        received += buffer.byteLength;
        chunkIndex++;

        onProgress?.(received, contentLength);
      } catch {
        // Network error mid-download — fall back to single fetch
        rangeSupported = false;
        break;
      }
    }

    if (rangeSupported && chunks.length > 0) {
      // Combine all chunks in order, then trigger download
      const combined = mergeBuffers(chunks, received);
      triggerDownload(combined, filename);
      return;
    }
    // Fall through to single-fetch fallback below
  }

  // ── Step 3: Single-fetch fallback ──
  onProgress?.(0, contentLength ?? 0);
  const res = await fetch(directURL);
  if (!res.ok) {
    throw new Error(`Audio fetch failed: ${res.status} ${res.statusText}`);
  }

  // Stream with progress if we know the total size
  const reader = res.body?.getReader();
  const total = contentLength ?? 0;
  const buffers: Uint8Array[] = [];
  let received = 0;

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffers.push(value);
      received += value.byteLength;
      if (total > 0) onProgress?.(received, total);
    }
  } else {
    const buffer = await res.arrayBuffer();
    buffers.push(new Uint8Array(buffer));
    received = buffers[0].byteLength;
    onProgress?.(received, received);
  }

  const combined = new Uint8Array(received);
  let offset = 0;
  for (const buf of buffers) {
    combined.set(buf, offset);
    offset += buf.byteLength;
  }

  triggerDownload(combined, filename);
}

// ── Helpers ──

function mergeBuffers(chunks: ArrayBuffer[], totalBytes: number): Uint8Array {
  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  return combined;
}

function triggerDownload(data: Uint8Array, filename: string): void {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: "audio/*" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
