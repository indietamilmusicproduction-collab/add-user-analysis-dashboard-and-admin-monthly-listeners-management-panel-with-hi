export function isValidUrl(url: string): boolean {
  if (!url || url.trim() === "") {
    return false;
  }
  return url.startsWith("http://") || url.startsWith("https://");
}
