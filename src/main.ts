import { Plugin, addIcon } from "obsidian";
import { CHATGPT_HOME_URL, ICON_ID, VIEW_TYPE_CHATGPT } from "./constants";
import { CHATGPT_ICON_SVG } from "./icon";
import { isRestorableUrl } from "./url";
import { ChatGPTView } from "./view";

interface PluginData {
  lastUrl?: string;
}

export default class ChatGPTPlugin extends Plugin {
  private data: PluginData = {};
  private saveTimer: number | null = null;

  async onload(): Promise<void> {
    const stored = (await this.loadData()) as PluginData | null;
    this.data = { ...stored };

    addIcon(ICON_ID, CHATGPT_ICON_SVG);
    this.registerView(VIEW_TYPE_CHATGPT, (leaf) => new ChatGPTView(leaf, this));

    this.addRibbonIcon(ICON_ID, "Open ChatGPT", () => void this.activateView());
    this.addCommand({
      id: "open-chatgpt",
      name: "Open ChatGPT",
      callback: () => void this.activateView(),
    });
  }

  onunload(): void {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
      void this.saveData(this.data);
    }
  }

  /** Where a new view should start: the last ChatGPT page, or the home page. */
  getStartUrl(): string {
    return isRestorableUrl(this.data.lastUrl) ? this.data.lastUrl : CHATGPT_HOME_URL;
  }

  /** Remember the current ChatGPT page. Saves are debounced to avoid disk churn. */
  rememberUrl(url: string): void {
    if (!isRestorableUrl(url) || url === this.data.lastUrl) return;
    this.data.lastUrl = url;
    if (this.saveTimer !== null) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      void this.saveData(this.data);
    }, 1000);
  }

  private async activateView(): Promise<void> {
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
}
