import { isProbablyBrowserRequest } from "./browser.js";

const HTML_CONTENT_TYPE = "text/html; charset=utf-8";
const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";
const TEXT_CONTENT_TYPE = "text/plain; charset=utf-8";

export interface WebsiteAssets {
  html: string;
  markdown: string;
}

export interface WebsiteRequestShape {
  headers?: Record<string, string | undefined>;
  method?: string;
  pathname: string;
}

export interface WebsiteResponseShape {
  body: string;
  contentType: string;
  headers?: Record<string, string>;
  statusCode: number;
}

export function normalizeWebsitePath(pathname: string): string {
  const decoded = safeDecodePath(pathname);
  if (decoded === "/") {
    return decoded;
  }

  const trimmed = decoded.replace(/\/+$/, "");
  return trimmed || "/";
}

export function resolveWebsiteResponse(
  request: WebsiteRequestShape,
  assets: WebsiteAssets
): WebsiteResponseShape {
  const method = (request.method ?? "GET").toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    return {
      statusCode: 405,
      contentType: TEXT_CONTENT_TYPE,
      headers: {
        Allow: "GET, HEAD",
      },
      body: "Method Not Allowed\n",
    };
  }

  const pathname = normalizeWebsitePath(request.pathname);
  const requestHeaders = request.headers ?? {};
  const browserRequest = isProbablyBrowserRequest({
    accept: requestHeaders.accept,
    userAgent: requestHeaders["user-agent"],
  });

  if (isSkillPath(pathname) || !browserRequest) {
    return {
      statusCode: 200,
      contentType: MARKDOWN_CONTENT_TYPE,
      body: assets.markdown,
    };
  }

  return {
    statusCode: 200,
    contentType: HTML_CONTENT_TYPE,
    body: assets.html,
  };
}

function safeDecodePath(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function isSkillPath(pathname: string): boolean {
  return pathname.toLowerCase() === "/skill.md";
}
