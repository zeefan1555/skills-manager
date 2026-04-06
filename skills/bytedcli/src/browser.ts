export interface BrowserDetectionInput {
  accept?: string | null;
  userAgent?: string | null;
}

const NON_BROWSER_USER_AGENT_RE =
  /(curl|wget|httpie|powershell|postman|insomnia|python-requests|python-urllib|go-http-client|okhttp|axios|node-fetch|undici|java\/|libwww-perl|aiohttp|ruby|apache-httpclient)/i;

const BROWSER_USER_AGENT_RE =
  /(mozilla|chrome|safari|firefox|edg\/|applewebkit|gecko|opr\/|opera)/i;

const HTML_ACCEPT_RE = /(text\/html|application\/xhtml\+xml)/i;

export function isProbablyBrowserRequest(input: BrowserDetectionInput): boolean {
  const userAgent = input.userAgent?.trim() ?? "";
  const accept = input.accept?.trim() ?? "";

  if (NON_BROWSER_USER_AGENT_RE.test(userAgent)) {
    return false;
  }

  if (HTML_ACCEPT_RE.test(accept)) {
    return true;
  }

  if (!userAgent) {
    return false;
  }

  return BROWSER_USER_AGENT_RE.test(userAgent);
}
