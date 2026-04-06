import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveWebsiteResponse } from "./response.js";

async function loadPreviewAssets(siteDir = process.cwd()) {
  const html = await readHtmlAsset(siteDir);
  const markdown = await readFile(path.join(siteDir, "SKILL.md"), "utf8");
  return { html, markdown };
}

async function startPreviewServer() {
  const assets = await loadPreviewAssets();
  const host = "0.0.0.0";
  const port = normalizePort(process.env.PORT ?? "9000");
  const server = createServer((req, res) => {
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
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });
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
  headers: Record<string, string | string[] | undefined>
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

function normalizePort(value: string): number {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : 9000;
}

void startPreviewServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
