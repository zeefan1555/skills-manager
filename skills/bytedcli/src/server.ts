import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildWebsiteSite } from "./build.js";
import {
  resolveWebsiteResponse,
  type WebsiteAssets,
} from "./response.js";

export interface StartWebsiteServerOptions {
  host?: string;
  port?: number;
  siteDir?: string;
}

export function createWebsiteHandler(
  assets: WebsiteAssets
): (req: IncomingMessage, res: ServerResponse) => void {
  return (req, res) => {
    const url = new URL(req.url ?? "/", "http://bytedcli.local");
    const response = resolveWebsiteResponse(
      {
        method: req.method,
        pathname: url.pathname,
        headers: normalizeHeaders(req.headers),
      },
      assets
    );

    res.statusCode = response.statusCode;
    res.setHeader("Content-Type", response.contentType);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    if (response.headers) {
      for (const [key, value] of Object.entries(response.headers)) {
        res.setHeader(key, value);
      }
    }

    if ((req.method ?? "GET").toUpperCase() === "HEAD") {
      res.end();
      return;
    }

    res.end(response.body);
  };
}

export async function loadWebsiteAssets(
  siteDir = getDefaultWebsiteSiteDir(WEBSITE_ROOT)
): Promise<WebsiteAssets> {
  try {
    return await readWebsiteAssets(siteDir);
  } catch {
    await buildWebsiteSite({ outDir: siteDir });
    return readWebsiteAssets(siteDir);
  }
}

export async function startWebsiteServer(
  options: StartWebsiteServerOptions = {}
): Promise<{ host: string; port: number; server: ReturnType<typeof createServer>; url: string }> {
  const host = options.host ?? process.env.HOST ?? "127.0.0.1";
  const port = normalizePort(options.port ?? process.env.PORT ?? "4310");
  const siteDir = options.siteDir ?? getDefaultWebsiteSiteDir(WEBSITE_ROOT);
  const assets = await loadWebsiteAssets(siteDir);
  const server = createServer(createWebsiteHandler(assets));

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  return {
    host,
    port,
    server,
    url: `http://${host}:${String(port)}`,
  };
}

async function readWebsiteAssets(siteDir: string): Promise<WebsiteAssets> {
  const [html, markdown] = await Promise.all([readHtmlAsset(siteDir), readFile(path.join(siteDir, "SKILL.md"), "utf8")]);

  return { html, markdown };
}

async function readHtmlAsset(siteDir: string): Promise<string> {
  for (const relativePath of ["landing.html", path.join("html", "main", "index.html"), "index.html"]) {
    try {
      return await readFile(path.join(siteDir, relativePath), "utf8");
    } catch {}
  }

  throw new Error(`Website HTML asset not found under ${siteDir}`);
}

function normalizeHeaders(
  headers: IncomingMessage["headers"]
): Record<string, string | undefined> {
  const normalized: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      normalized[key] = value.join(", ");
      continue;
    }

    normalized[key] = value ?? undefined;
  }

  return normalized;
}

function normalizePort(value: number | string): number {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : 4310;
}

function getDefaultWebsiteSiteDir(websiteRoot: string): string {
  if (
    existsSync(path.join(websiteRoot, "index.html")) &&
    existsSync(path.join(websiteRoot, "SKILL.md"))
  ) {
    return websiteRoot;
  }

  return path.join(websiteRoot, "site");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEBSITE_ROOT = resolveWebsiteRoot(__dirname);

function resolveWebsiteRoot(currentDir: string): string {
  const parentDir = path.resolve(currentDir, "..");
  return path.basename(parentDir) === ".dist" ? path.dirname(parentDir) : parentDir;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  void startWebsiteServer()
    .then(({ url }) => {
      process.stdout.write(`bytedcli website listening on ${url}\n`);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      process.exitCode = 1;
    });
}
