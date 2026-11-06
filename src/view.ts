import { ItemView, Platform, WorkspaceLeaf, setIcon } from "obsidian";
import {
  CHATGPT_HOME_URL,
  ICON_ID,
  LOAD_TIMEOUT_MS,
  VIEW_TYPE_CHATGPT,
  WEBVIEW_PARTITION,
} from "./constants";
import type ChatGPTPlugin from "./main";
import { isRestorableUrl } from "./url";

/** The subset of Electron's <webview> element API that this plugin uses. */
interface WebviewElement extends HTMLElement {
  loadURL(url: string): Promise<void>;
  getURL(): string;
  canGoBack(): boolean;
  canGoForward(): boolean;
  goBack(): void;
  goForward(): void;
  reload(): void;
  stop(): void;
}

interface NavigateEvent extends Event {
  url: string;
}

interface FailLoadEvent extends Event {
  errorCode: number;
  errorDescription: string;
  isMainFrame: boolean;
}

/** Chromium's error code for a load that was cancelled (e.g. by a redirect). Not a real failure. */
const ERR_ABORTED = -3;

export class ChatGPTView extends ItemView {
  private plugin: ChatGPTPlugin;
  private webview: WebviewElement | null = null;
  private stageEl!: HTMLElement;
  private statusEl!: HTMLElement;
  private backBtn!: HTMLButtonElement;
  private forwardBtn!: HTMLButtonElement;
  private reloadBtn!: HTMLButtonElement;
  private loadTimer: number | null = null;
  private domReady = false;
  private loading = false;

  constructor(leaf: WorkspaceLeaf, plugin: ChatGPTPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_CHATGPT;
  }

  getDisplayText(): string {
    return "ChatGPT";
  }

  getIcon(): string {
    return ICON_ID;
  }

  async onOpen(): Promise<void> {
    const root = this.contentEl;
    root.empty();
    root.addClass("chatgpt-view");

    this.buildToolbar(root);
    this.stageEl = root.createDiv({ cls: "chatgpt-stage" });
    this.statusEl = this.stageEl.createDiv({ cls: "chatgpt-status is-hidden" });

    if (!Platform.isDesktopApp) {
      this.showStatus(
        "Embedded browser unavailable",
        "ChatGPT can only be embedded in the Obsidian desktop app. Open it in your browser instead.",
        false,
      );
      return;
    }
    this.mountWebview();
  }

  async onClose(): Promise<void> {
    this.clearLoadTimer();
    this.unmountWebview();
  }

  // ---------------------------------------------------------------- toolbar

  private buildToolbar(root: HTMLElement): void {
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
    this.addButton(bar, "external-link", "Open in system browser", () =>
      this.openInSystemBrowser(),
    );
    this.updateControls();
  }

  private addButton(
    parent: HTMLElement,
    icon: string,
    label: string,
    onClick: () => void,
  ): HTMLButtonElement {
    const btn = parent.createEl("button", {
      cls: "clickable-icon chatgpt-btn",
      attr: { "aria-label": label, type: "button" },
    });
    setIcon(btn, icon);
    btn.addEventListener("click", onClick);
    return btn;
  }

  private updateControls(): void {
    let canBack = false;
    let canForward = false;
    if (this.webview && this.domReady) {
      try {
        canBack = this.webview.canGoBack();
        canForward = this.webview.canGoForward();
      } catch {
        // The guest page is not ready to answer; keep both disabled.
      }
    }
    this.backBtn.disabled = !canBack;
    this.forwardBtn.disabled = !canForward;
    this.reloadBtn.disabled = !this.webview || !this.domReady;

    const reloadLabel = this.loading ? "Stop loading" : "Reload";
    setIcon(this.reloadBtn, this.loading ? "x" : "refresh-cw");
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
  private mountWebview(): void {
    this.hideStatus();
    this.domReady = false;
    this.loading = true;

    const wv = this.contentEl.ownerDocument.createElement("webview") as unknown as WebviewElement;
    wv.className = "chatgpt-webview";
    wv.setAttribute("partition", WEBVIEW_PARTITION);
    wv.setAttribute("webpreferences", "nodeIntegration=no, contextIsolation=yes");
    // Lets sign-in flows and links that open a new window work. The popup inherits the
    // same restrictions as this webview (no Node integration, same partition).
    wv.setAttribute("allowpopups", "");
    wv.setAttribute("src", this.plugin.getStartUrl());
    this.stageEl.appendChild(wv);
    this.webview = wv;

    // If the <webview> tag is not enabled in this Obsidian build it is an unknown
    // element with no methods. Say so instead of showing a blank panel.
    if (typeof wv.loadURL !== "function") {
      this.unmountWebview();
      this.loading = false;
      this.showStatus(
        "Embedded browser unavailable",
        "This version of Obsidian does not support embedded web pages. Open ChatGPT in your browser instead.",
        false,
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
    const onNavigate = (e: Event) => {
      this.plugin.rememberUrl((e as NavigateEvent).url);
      this.updateControls();
    };
    wv.addEventListener("did-navigate", onNavigate);
    wv.addEventListener("did-navigate-in-page", onNavigate);
    wv.addEventListener("did-fail-load", (e: Event) => {
      const fail = e as FailLoadEvent;
      if (!fail.isMainFrame || fail.errorCode === ERR_ABORTED) return;
      this.clearLoadTimer();
      this.loading = false;
      this.showStatus(
        "ChatGPT could not be loaded",
        `${fail.errorDescription || "The page failed to load"}. Check your connection, or open ChatGPT in your browser.`,
        true,
      );
      this.updateControls();
    });
    wv.addEventListener("render-process-gone", () => {
      this.clearLoadTimer();
      this.showStatus(
        "The ChatGPT page stopped working",
        "Try loading it again, or open ChatGPT in your browser.",
        true,
      );
    });
    // Legacy event: only fires on older Electron builds. Send new-window links to the browser.
    wv.addEventListener("new-window", (e: Event) => {
      const url = (e as NavigateEvent).url;
      if (/^https?:/i.test(url)) window.open(url);
    });

    this.clearLoadTimer();
    this.loadTimer = window.setTimeout(() => {
      if (this.domReady) return;
      this.showStatus(
        "ChatGPT is not responding",
        "The page has not finished loading. It may be slow, or embedding may be blocked here. You can keep waiting, try again, or open it in your browser.",
        true,
      );
    }, LOAD_TIMEOUT_MS);

    this.updateControls();
  }

  private unmountWebview(): void {
    this.webview?.remove();
    this.webview = null;
    this.domReady = false;
  }

  private retry(): void {
    this.unmountWebview();
    this.mountWebview();
  }

  private clearLoadTimer(): void {
    if (this.loadTimer !== null) {
      window.clearTimeout(this.loadTimer);
      this.loadTimer = null;
    }
  }

  // ----------------------------------------------------------- external / UI

  private openInSystemBrowser(): void {
    let target = CHATGPT_HOME_URL;
    try {
      const current = this.webview && this.domReady ? this.webview.getURL() : "";
      if (isRestorableUrl(current)) target = current;
    } catch {
      // Fall back to the home page.
    }
    window.open(target);
  }

  private showStatus(title: string, message: string, canRetry: boolean): void {
    this.statusEl.empty();
    const icon = this.statusEl.createDiv({ cls: "chatgpt-status-icon" });
    setIcon(icon, ICON_ID);
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

  private hideStatus(): void {
    this.statusEl.addClass("is-hidden");
  }
}
