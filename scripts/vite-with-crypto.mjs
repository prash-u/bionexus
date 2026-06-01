import { webcrypto } from "node:crypto";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== "function") {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: webcrypto
  });
}

const require = createRequire(import.meta.url);
const vitePackagePath = require.resolve("vite/package.json");
const viteCliPath = join(dirname(vitePackagePath), "bin/vite.js");

await import(pathToFileURL(viteCliPath).href);
