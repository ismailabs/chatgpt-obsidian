export const VIEW_TYPE_CHATGPT = "chatgpt-obsidian-view";
export const ICON_ID = "chatgpt-obsidian-logo";
export const CHATGPT_HOME_URL = "https://chatgpt.com/";

/**
 * Named, persistent Electron session partition. Cookies and local storage for the
 * embedded page live here, isolated from Obsidian's own session, and survive restarts.
 */
export const WEBVIEW_PARTITION = "persist:chatgpt-obsidian";

/** If the page has not reported "dom-ready" after this long, show the fallback panel. */
export const LOAD_TIMEOUT_MS = 20000;
