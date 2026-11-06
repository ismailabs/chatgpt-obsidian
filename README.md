# ChatGPT for Obsidian

Opens the real [chatgpt.com](https://chatgpt.com) website in an Obsidian sidebar view. Desktop only.

> **Status: not yet tested inside Obsidian.** The source compiles to a bundle, but the plugin has not been run in a
> real Obsidian install, so embedded sign-in and browsing are unverified. See [Limitations](#limitations).

This is an unofficial plugin. ChatGPT and OpenAI are trademarks of OpenAI, which is not affiliated with it.

## What it does

- A ribbon icon (the OpenAI mark) and an **Open ChatGPT** command open a ChatGPT view in the right sidebar.
- Loads https://chatgpt.com in an embedded browser (Electron `<webview>`). Sign in with your existing account.
- Keeps you signed in between restarts (persistent session partition).
- Toolbar: back, forward, reload/stop, and **Open in system browser**.
- Reopens the last ChatGPT page you were on (see below).
- If the page cannot load, or embedding is unavailable, a panel offers **Open in browser**. The plugin never pretends the page is embedded when it is not.

Nothing else: no API keys, no other AI services, no access to your notes.

## Install

1. Unzip so you have `YourVault/.obsidian/plugins/chatgpt-obsidian/` containing `manifest.json`, `main.js` and `styles.css`.
2. In Obsidian go to **Settings > Community plugins**, turn off Restricted mode, then enable **ChatGPT**.
3. Click the ChatGPT icon in the left ribbon.

## Build from source

Requires Node.js 18+ and npm.

```bash
npm install
npm run build   # type-checks with tsc, then bundles src/ to main.js with esbuild
npm run dev     # rebuild on change (inline sourcemaps)
```

`main.js` is intentionally not minified so it can be read and audited.

`package-lock.json` in this download is a root-only stub (it lists no resolved dependencies). `npm install` fills it in;
commit the result. Use `npm install`, not `npm ci`, the first time.

## How it works, and what it does not do

Obsidian is an Electron app. Rather than assume chatgpt.com can be framed in an `<iframe>` (sites commonly block this
with `X-Frame-Options` or CSP `frame-ancestors`), the plugin uses Electron's `<webview>` tag.

- **No Node.js access for the website.** No `nodeintegration`, no `preload` script, `contextIsolation` on, web security left on. The page cannot reach Obsidian, your vault or the file system.
- **Separate, persistent session.** The page uses its own partition (`persist:chatgpt-obsidian`), so its cookies are isolated from Obsidian and survive restarts. To sign out, use ChatGPT's own log-out.
- **No bypassing.** The plugin does not change the user agent, strip headers, or work around sign-in, bot checks or other protections. If the site refuses to work in an embedded browser, use **Open in system browser**.
- **What the plugin stores:** only the last `https://chatgpt.com/...` URL, in the plugin's `data.json`. Authentication and API URLs are never saved.

### "Remember workspace state"

The plugin restores the last ChatGPT page (for example, your last conversation). Your ChatGPT workspace, projects and
history live in your ChatGPT account and are restored by the site itself once you are signed in. Obsidian also
remembers that the view was open in the sidebar.

## Limitations

These describe how embedded browsers are expected to behave, not confirmed test results:

- **Sign-in providers may refuse embedded browsers.** Some identity providers (Google in particular) reject sign-in from embedded web views. If that happens, sign in with email and password, or use **Open in system browser**.
- **Bot or security checks may not complete** in an embedded browser. If the page has not loaded after 20 seconds, a panel offers the system browser.
- **Links that open a new window** use Electron popup windows (`allowpopups`) so sign-in flows can work. Popups carry the same restrictions as the view. How external links inside chats behave is untested.
- **Desktop only.** Mobile Obsidian has no `<webview>`; the manifest marks the plugin desktop-only.
- The minimum Obsidian version in `manifest.json` (1.5.0) is a conservative estimate, not a tested floor.

## Project layout

```
manifest.json       plugin metadata (id: chatgpt-obsidian, version 1.0.0)
main.js             built bundle (generated from src/)
styles.css          toolbar and fallback panel styles, using Obsidian theme variables
src/main.ts         plugin entry: ribbon icon, command, view registration, last-URL storage
src/view.ts         sidebar view: toolbar, <webview>, load/failure handling, fallback panel
src/icon.ts         the OpenAI mark as an Obsidian icon
src/url.ts          rules for which URLs may be remembered
src/constants.ts    view type, icon id, home URL, session partition, timeout
```

## About the logo

The mark in `src/icon.ts` is an SVG path reproduced from memory and checked by rendering it; it was not copied from an
official OpenAI asset file. If you need the official artwork, replace `MARK_PATH` using OpenAI's brand guidelines.
