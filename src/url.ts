/**
 * True for https URLs on chatgpt.com that are safe to remember and reopen.
 * Auth and API endpoints are excluded: they are one-time redirects, not places to return to.
 */
export function isRestorableUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    const onChatGPT =
      url.hostname === "chatgpt.com" || url.hostname.endsWith(".chatgpt.com");
    const transient =
      url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth");
    return url.protocol === "https:" && onChatGPT && !transient;
  } catch {
    return false;
  }
}
