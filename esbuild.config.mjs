import esbuild from "esbuild";
import { builtinModules } from "node:module";
import process from "node:process";

const production = process.argv[2] === "production";

const context = await esbuild.context({
  banner: {
    js: "/* ChatGPT for Obsidian - bundled from src/ with esbuild. See README.md. */",
  },
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/*",
    "@lezer/*",
    ...builtinModules,
    ...builtinModules.map((m) => `node:${m}`),
  ],
  format: "cjs",
  target: "es2020",
  platform: "node",
  logLevel: "info",
  sourcemap: production ? false : "inline",
  treeShaking: true,
  minify: false, // kept readable on purpose: this plugin hosts a login page, so users should be able to audit it
  outfile: "main.js",
});

if (production) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}
