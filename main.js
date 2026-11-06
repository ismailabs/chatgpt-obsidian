/* ChatGPT for Obsidian - bundled from src/ with esbuild. See README.md. */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ChatGPTPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/constants.ts
var VIEW_TYPE_CHATGPT = "chatgpt-obsidian-view";
var ICON_ID = "chatgpt-obsidian-logo";
var CHATGPT_HOME_URL = "https://chatgpt.com/";
var WEBVIEW_PARTITION = "persist:chatgpt-obsidian";
var LOAD_TIMEOUT_MS = 2e4;

// src/icon.ts
var MARK_PATH = "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";
var CHATGPT_ICON_SVG = `<g transform="scale(4.1667)"><path d="${MARK_PATH}" fill="currentColor" stroke="none"/></g>`;

// src/url.ts
function isRestorableUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    const onChatGPT = url.hostname === "chatgpt.com" || url.hostname.endsWith(".chatgpt.com");
    const transient = url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth");
    return url.protocol === "https:" && onChatGPT && !transient;
  } catch {
    return false;
  }
}

// src/view.ts
var import_obsidian = require("obsidian");
var ERR_ABORTED = -3;
var ChatGPTView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    __publicField(this, "plugin");
    __publicField(this, "webview", null);
    __publicField(this, "stageEl");
    __publicField(this, "statusEl");
    __publicField(this, "backBtn");
    __publicField(this, "forwardBtn");
    __publicField(this, "reloadBtn");
    __publicField(this, "loadTimer", null);
    __publicField(this, "domReady", false);
    __publicField(this, "loading", false);
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_CHATGPT;
  }
  getDisplayText() {
    return "ChatGPT";
  }
  getIcon() {
    return ICON_ID;
  }
  async onOpen() {
    const root = this.contentEl;
    root.empty();
    root.addClass("chatgpt-view");
    this.buildToolbar(root);
    this.stageEl = root.createDiv({ cls: "chatgpt-stage" });
    this.statusEl = this.stageEl.createDiv({ cls: "chatgpt-status is-hidden" });
    if (!import_obsidian.Platform.isDesktopApp) {
      this.showStatus(
        "Embedded browser unavailable",
        "ChatGPT can only be embedded in the Obsidian desktop app. Open it in your browser instead.",
        false
      );
      return;
    }
    this.mountWebview();
  }
  async onClose() {
    this.clearLoadTimer();
    this.unmountWebview();
  }
  // ---------------------------------------------------------------- toolbar
  buildToolbar(root) {
    const bar = root.createDiv({ cls: "chatgpt-toolbar" });
    this.backBtn = this.addButton(bar, "arrow-left", "Back", () => {
      if (this.webview && this.domReady && this.webview.canGoBack()) this.webview.goBack();
    });
    this.forwardBtn = this.addButton(bar, "arrow-right", "Forward", () => {
      if (this.webview && this.domReady && this.webview.canGoForward()) this.webview.goForward();
    });
    this.reloadBtn = this.addButton(bar, "refresh-cw", "Reload", () => {
      if (!this.webview || !this.domReady) return;
      if (this.loading) this.webview.stop();
      else this.webview.reload();
    });
    bar.createDiv({ cls: "chatgpt-spacer" });
    this.addButton(
      bar,
      "external-link",
      "Open in system browser",
      () => this.openInSystemBrowser()
    );
    this.updateControls();
  }
  addButton(parent, icon, label, onClick) {
    const btn = parent.createEl("button", {
      cls: "clickable-icon chatgpt-btn",
      attr: { "aria-label": label, type: "button" }
    });
    (0, import_obsidian.setIcon)(btn, icon);
    btn.addEventListener("click", onClick);
    return btn;
  }
  updateControls() {
    let canBack = false;
    let canForward = false;
    if (this.webview && this.domReady) {
      try {
        canBack = this.webview.canGoBack();
        canForward = this.webview.canGoForward();
      } catch {
      }
    }
    this.backBtn.disabled = !canBack;
    this.forwardBtn.disabled = !canForward;
    this.reloadBtn.disabled = !this.webview || !this.domReady;
    const reloadLabel = this.loading ? "Stop loading" : "Reload";
    (0, import_obsidian.setIcon)(this.reloadBtn, this.loading ? "x" : "refresh-cw");
    this.reloadBtn.setAttribute("aria-label", reloadLabel);
  }
  // ---------------------------------------------------------------- webview
  /**
   * Mounts Electron's <webview> tag. Notes on the security posture:
   * - No `nodeintegration`, no `preload`, no `disablewebsecurity`: the remote page gets
   *   no Node.js or Obsidian API access, and web security stays on.
   * - A named persistent partition keeps the session (cookies) between restarts and
   *   keeps it separate from Obsidian's own.
   * - An <iframe> is not used: chatgpt.com is not expected to permit framing.
   */
  mountWebview() {
    this.hideStatus();
    this.domReady = false;
    this.loading = true;
    const wv = this.contentEl.ownerDocument.createElement("webview");
    wv.className = "chatgpt-webview";
    wv.setAttribute("partition", WEBVIEW_PARTITION);
    wv.setAttribute("webpreferences", "nodeIntegration=no, contextIsolation=yes");
    wv.setAttribute("allowpopups", "");
    wv.setAttribute("src", this.plugin.getStartUrl());
    this.stageEl.appendChild(wv);
    this.webview = wv;
    if (typeof wv.loadURL !== "function") {
      this.unmountWebview();
      this.loading = false;
      this.showStatus(
        "Embedded browser unavailable",
        "This version of Obsidian does not support embedded web pages. Open ChatGPT in your browser instead.",
        false
      );
      this.updateControls();
      return;
    }
    wv.addEventListener("dom-ready", () => {
      this.domReady = true;
      this.clearLoadTimer();
      this.hideStatus();
      wv.classList.add("is-ready");
      this.updateControls();
    });
    wv.addEventListener("did-start-loading", () => {
      this.loading = true;
      this.updateControls();
    });
    wv.addEventListener("did-stop-loading", () => {
      this.loading = false;
      this.updateControls();
    });
    const onNavigate = (e) => {
      this.plugin.rememberUrl(e.url);
      this.updateControls();
    };
    wv.addEventListener("did-navigate", onNavigate);
    wv.addEventListener("did-navigate-in-page", onNavigate);
    wv.addEventListener("did-fail-load", (e) => {
      const fail = e;
      if (!fail.isMainFrame || fail.errorCode === ERR_ABORTED) return;
      this.clearLoadTimer();
      this.loading = false;
      this.showStatus(
        "ChatGPT could not be loaded",
        `${fail.errorDescription || "The page failed to load"}. Check your connection, or open ChatGPT in your browser.`,
        true
      );
      this.updateControls();
    });
    wv.addEventListener("render-process-gone", () => {
      this.clearLoadTimer();
      this.showStatus(
        "The ChatGPT page stopped working",
        "Try loading it again, or open ChatGPT in your browser.",
        true
      );
    });
    wv.addEventListener("new-window", (e) => {
      const url = e.url;
      if (/^https?:/i.test(url)) window.open(url);
    });
    this.clearLoadTimer();
    this.loadTimer = window.setTimeout(() => {
      if (this.domReady) return;
      this.showStatus(
        "ChatGPT is not responding",
        "The page has not finished loading. It may be slow, or embedding may be blocked here. You can keep waiting, try again, or open it in your browser.",
        true
      );
    }, LOAD_TIMEOUT_MS);
    this.updateControls();
  }
  unmountWebview() {
    this.webview?.remove();
    this.webview = null;
    this.domReady = false;
  }
  retry() {
    this.unmountWebview();
    this.mountWebview();
  }
  clearLoadTimer() {
    if (this.loadTimer !== null) {
      window.clearTimeout(this.loadTimer);
      this.loadTimer = null;
    }
  }
  // ----------------------------------------------------------- external / UI
  openInSystemBrowser() {
    let target = CHATGPT_HOME_URL;
    try {
      const current = this.webview && this.domReady ? this.webview.getURL() : "";
      if (isRestorableUrl(current)) target = current;
    } catch {
    }
    window.open(target);
  }
  showStatus(title, message, canRetry) {
    this.statusEl.empty();
    const icon = this.statusEl.createDiv({ cls: "chatgpt-status-icon" });
    (0, import_obsidian.setIcon)(icon, ICON_ID);
    this.statusEl.createDiv({ cls: "chatgpt-status-title", text: title });
    this.statusEl.createDiv({ cls: "chatgpt-status-message", text: message });
    const actions = this.statusEl.createDiv({ cls: "chatgpt-status-actions" });
    const open = actions.createEl("button", { cls: "mod-cta", text: "Open in browser" });
    open.addEventListener("click", () => this.openInSystemBrowser());
    if (canRetry) {
      const retry = actions.createEl("button", { text: "Try again" });
      retry.addEventListener("click", () => this.retry());
    }
    this.statusEl.removeClass("is-hidden");
  }
  hideStatus() {
    this.statusEl.addClass("is-hidden");
  }
};

// src/main.ts
var ChatGPTPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    __publicField(this, "data", {});
    __publicField(this, "saveTimer", null);
  }
  async onload() {
    const stored = await this.loadData();
    this.data = { ...stored };
    (0, import_obsidian2.addIcon)(ICON_ID, CHATGPT_ICON_SVG);
    this.registerView(VIEW_TYPE_CHATGPT, (leaf) => new ChatGPTView(leaf, this));
    this.addRibbonIcon(ICON_ID, "Open ChatGPT", () => void this.activateView());
    this.addCommand({
      id: "open-chatgpt",
      name: "Open ChatGPT",
      callback: () => void this.activateView()
    });
  }
  onunload() {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
      void this.saveData(this.data);
    }
  }
  /** Where a new view should start: the last ChatGPT page, or the home page. */
  getStartUrl() {
    return isRestorableUrl(this.data.lastUrl) ? this.data.lastUrl : CHATGPT_HOME_URL;
  }
  /** Remember the current ChatGPT page. Saves are debounced to avoid disk churn. */
  rememberUrl(url) {
    if (!isRestorableUrl(url) || url === this.data.lastUrl) return;
    this.data.lastUrl = url;
    if (this.saveTimer !== null) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      void this.saveData(this.data);
    }, 1e3);
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_CHATGPT)[0];
    if (!leaf) {
      const right = workspace.getRightLeaf(false);
      if (!right) return;
      await right.setViewState({ type: VIEW_TYPE_CHATGPT, active: true });
      leaf = right;
    }
    await workspace.revealLeaf(leaf);
  }
};
