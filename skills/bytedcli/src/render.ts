import type { LocalizedText } from "./content.js";
import {
  accessModes,
  capabilityGroups,
  ctaOpenRepo,
  ctaOpenSkill,
  heroDescription,
  heroEyebrow,
  heroStats,
  heroTitle,
  howToUseCopy,
  howToUseTitle,
  languageLabel,
  pageDescription,
  pageTitle,
  quickCommands,
  quickCurlHintCopy,
  quickCurlHintTitle,
  quickStartCopy,
  quickStartTitle,
  resourceLinks,
  resourcePathsCopy,
  resourcePathsTitle,
} from "./content.js";

export interface RenderLandingPageOptions {
  faviconHref?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeInlineScriptJson(value: string): string {
  return value.replace(/</g, "\\u003c");
}

function renderLocalizedText(text: LocalizedText): string {
  return [
    `<span class="locale-text locale-en" lang="en">${escapeHtml(text.en)}</span>`,
    `<span class="locale-text locale-zh" lang="zh-CN">${escapeHtml(text.zh)}</span>`,
  ].join("");
}

function renderStat(value: string, label: LocalizedText): string {
  return [
    "<div class=\"stat-chip\">",
    `  <span class="stat-value">${escapeHtml(value)}</span>`,
    `  <span class="stat-label">${renderLocalizedText(label)}</span>`,
    "</div>",
  ].join("\n");
}

function renderTagList(items: readonly string[]): string {
  return [
    "<div class=\"tag-list\">",
    ...items.map((item) => `  <span class="tag">${escapeHtml(item)}</span>`),
    "</div>",
  ].join("\n");
}

function renderCommand(command: string): string {
  return `<code class="command-line">${escapeHtml(command)}</code>`;
}

function renderCurlCommand(): string {
  return [
    "<code class=\"command-line\">",
    "  curl <span data-runtime-origin>https://bytedcli.example.com</span>",
    "</code>",
  ].join("\n");
}

function renderAccessModes(): string {
  return accessModes
    .map(
      (mode) => `
        <article class="mini-panel accent-${escapeHtml(mode.accent)}">
          <h3>${renderLocalizedText(mode.title)}</h3>
          <p>${renderLocalizedText(mode.description)}</p>
        </article>
      `.trim()
    )
    .join("\n");
}

function renderCapabilityCards(): string {
  return capabilityGroups
    .map(
      (group, index) => `
        <section class="tile ${escapeHtml(group.layoutClassName)} accent-${escapeHtml(group.accent)}" style="--tile-delay:${String(220 + index * 70)}ms">
          <div class="tile-topline">${renderLocalizedText(group.title)}</div>
          <p class="tile-copy">${renderLocalizedText(group.description)}</p>
          ${renderTagList(group.items)}
        </section>
      `.trim()
    )
    .join("\n");
}

function renderResourceCards(): string {
  return resourceLinks
    .map(
      (resource, index) => `
        <a
          class="resource-card accent-${escapeHtml(resource.accent)}"
          href="${escapeHtml(resource.href)}"
          ${resource.href.startsWith("http") ? 'target="_blank" rel="noreferrer noopener"' : ""}
          style="--tile-delay:${String(560 + index * 70)}ms"
        >
          <span class="resource-title">${renderLocalizedText(resource.title)}</span>
          <span class="resource-note">${renderLocalizedText(resource.note)}</span>
        </a>
      `.trim()
    )
    .join("\n");
}

function renderLocaleSwitcher(): string {
  return `
    <div class="locale-switch-wrap">
      <span class="locale-switch-label">${renderLocalizedText(languageLabel)}</span>
      <div class="locale-switch" role="group" aria-label="Language switch">
        <button type="button" class="locale-button is-active" data-locale-switch="en" aria-pressed="true">EN</button>
        <button type="button" class="locale-button" data-locale-switch="zh" aria-pressed="false">中文</button>
      </div>
    </div>
  `.trim();
}

function renderLocaleBootScript(): string {
  const localeCopy = escapeInlineScriptJson(
    JSON.stringify({
      ogLocale: {
        en: "en_US",
        zh: "zh_CN",
      },
      pageDescription,
      pageTitle,
    })
  );

  return `
    <script>
      (() => {
        const copy = ${localeCopy};
        const storageKey = "bytedcli.website.locale";
        const docEl = document.documentElement;
        const titleEl = document.querySelector("title");
        const descriptionEl = document.querySelector('meta[name="description"]');
        const ogTitleEl = document.querySelector('meta[property="og:title"]');
        const ogDescriptionEl = document.querySelector('meta[property="og:description"]');
        const ogLocaleEl = document.querySelector('meta[property="og:locale"]');
        const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
        const twitterDescriptionEl = document.querySelector('meta[name="twitter:description"]');
        const runtimeOriginEls = document.querySelectorAll("[data-runtime-origin]");

        const normalizeLocale = (value) => (value === "zh" ? "zh" : "en");
        const pickRuntimeOrigin = () => {
          if (location.protocol === "http:" || location.protocol === "https:") {
            return location.origin;
          }

          return location.host || "https://bytedcli.example.com";
        };

        const pickInitialLocale = () => {
          try {
            const saved = localStorage.getItem(storageKey);
            if (saved === "en" || saved === "zh") {
              return saved;
            }
          } catch {}

          const browserLanguage = (navigator.language || "").toLowerCase();
          return browserLanguage.startsWith("zh") ? "zh" : "en";
        };

        const applyLocale = (value) => {
          const locale = normalizeLocale(value);
          docEl.dataset.locale = locale;
          docEl.lang = locale === "zh" ? "zh-CN" : "en";

          if (titleEl) {
            titleEl.textContent = copy.pageTitle[locale];
          }

          if (descriptionEl) {
            descriptionEl.setAttribute("content", copy.pageDescription[locale]);
          }

          if (ogTitleEl) {
            ogTitleEl.setAttribute("content", copy.pageTitle[locale]);
          }

          if (ogDescriptionEl) {
            ogDescriptionEl.setAttribute("content", copy.pageDescription[locale]);
          }

          if (ogLocaleEl) {
            ogLocaleEl.setAttribute("content", copy.ogLocale[locale]);
          }

          if (twitterTitleEl) {
            twitterTitleEl.setAttribute("content", copy.pageTitle[locale]);
          }

          if (twitterDescriptionEl) {
            twitterDescriptionEl.setAttribute("content", copy.pageDescription[locale]);
          }

          document.querySelectorAll("[data-locale-switch]").forEach((button) => {
            const active = button.getAttribute("data-locale-switch") === locale;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
          });

          try {
            localStorage.setItem(storageKey, locale);
          } catch {}
        };

        const runtimeOrigin = pickRuntimeOrigin();
        runtimeOriginEls.forEach((el) => {
          el.textContent = runtimeOrigin;
        });

        applyLocale(pickInitialLocale());

        document.querySelectorAll("[data-locale-switch]").forEach((button) => {
          button.addEventListener("click", () => {
            applyLocale(button.getAttribute("data-locale-switch"));
          });
        });
      })();
    </script>
  `.trim();
}

export function renderLandingPage(options: RenderLandingPageOptions = {}): string {
  const faviconHref =
    options.faviconHref ??
    "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2032%2032%27%3E%3Crect%20width%3D%2732%27%20height%3D%2732%27%20fill%3D%27%230d1413%27/%3E%3Crect%20x%3D%274%27%20y%3D%274%27%20width%3D%2724%27%20height%3D%2724%27%20fill%3D%27%23f2b35d%27/%3E%3Cpath%20d%3D%27M10%2011h3v10h-3zm9%200h3v10h-3zm-6%204h6v3h-6z%27%20fill%3D%27%230d1413%27/%3E%3C/svg%3E";
  const structuredData = escapeInlineScriptJson(
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: heroTitle,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Linux",
      description: pageDescription.en,
      inLanguage: ["en", "zh-CN"],
    })
  );

  return `<!DOCTYPE html>
<html lang="en" data-locale="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle.en)}</title>
    <meta name="description" content="${escapeHtml(pageDescription.en)}" />
    <meta name="application-name" content="${escapeHtml(heroTitle)}" />
    <meta name="apple-mobile-web-app-title" content="${escapeHtml(heroTitle)}" />
    <meta name="theme-color" content="#0d1413" />
    <meta name="color-scheme" content="dark" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(heroTitle)}" />
    <meta property="og:title" content="${escapeHtml(pageTitle.en)}" />
    <meta property="og:description" content="${escapeHtml(pageDescription.en)}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:locale:alternate" content="zh_CN" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle.en)}" />
    <meta name="twitter:description" content="${escapeHtml(pageDescription.en)}" />
    <link rel="icon" type="image/png" href="${escapeHtml(faviconHref)}" />
    <link rel="apple-touch-icon" href="${escapeHtml(faviconHref)}" />
    <script type="application/ld+json">${structuredData}</script>
    <style>
      :root {
        --bg: #0d1413;
        --panel: #162222;
        --panel-soft: #1f2f2d;
        --panel-strong: #243836;
        --line: #2f4d48;
        --ink: #f5edd7;
        --muted: #a6b7b2;
        --shadow: #081110;
        --gold: #f2b35d;
        --mint: #74d8b7;
        --coral: #ef7d57;
        --lime: #a3cf62;
        --sky: #72b7ff;
      }

      * {
        box-sizing: border-box;
      }

      html {
        background: var(--bg);
      }

      html[data-locale="en"] .locale-zh {
        display: none;
      }

      html[data-locale="zh"] .locale-en {
        display: none;
      }

      html[data-locale="zh"] .locale-zh,
      html[data-locale="en"] .locale-en {
        display: inline;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "IBM Plex Mono", "JetBrains Mono", "Azeret Mono", "SFMono-Regular", Menlo, Consolas, monospace;
        color: var(--ink);
        background:
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px) 0 0 / 18px 18px,
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px) 0 0 / 18px 18px,
          radial-gradient(circle at top, rgba(116, 216, 183, 0.14), transparent 28%),
          radial-gradient(circle at bottom right, rgba(242, 179, 93, 0.18), transparent 30%),
          var(--bg);
      }

      body::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.25;
        background:
          linear-gradient(90deg, transparent 0, transparent calc(100% - 22px), rgba(114, 183, 255, 0.08) calc(100% - 22px), rgba(114, 183, 255, 0.08) 100%),
          linear-gradient(180deg, transparent 0, transparent calc(100% - 20px), rgba(163, 207, 98, 0.08) calc(100% - 20px), rgba(163, 207, 98, 0.08) 100%);
        mask: linear-gradient(#000, transparent 88%);
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      button {
        font: inherit;
      }

      .shell {
        width: min(1180px, calc(100vw - 32px));
        margin: 0 auto;
        padding: 28px 0 48px;
      }

      .mosaic {
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 18px;
      }

      .tile,
      .resource-card {
        position: relative;
        border: 3px solid var(--line);
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent 48%),
          var(--panel);
        box-shadow: 8px 8px 0 var(--shadow);
        padding: 22px;
        overflow: hidden;
        animation: tile-in 520ms steps(10) both;
        animation-delay: var(--tile-delay, 0ms);
      }

      .tile::after,
      .resource-card::after {
        content: "";
        position: absolute;
        right: 14px;
        bottom: 14px;
        width: 18px;
        height: 18px;
        background: currentColor;
        opacity: 0.18;
        box-shadow:
          -20px 0 0 currentColor,
          0 -20px 0 currentColor,
          -20px -20px 0 currentColor;
      }

      .tile:hover,
      .resource-card:hover {
        transform: translate(-2px, -2px);
      }

      .hero {
        grid-column: span 12;
        min-height: 280px;
        background:
          linear-gradient(135deg, rgba(242, 179, 93, 0.18), transparent 45%),
          linear-gradient(225deg, rgba(116, 216, 183, 0.12), transparent 35%),
          var(--panel);
      }

      .span-12 {
        grid-column: span 12;
      }

      .span-7 {
        grid-column: span 7;
      }

      .span-6 {
        grid-column: span 6;
      }

      .span-5 {
        grid-column: span 5;
      }

      .span-4 {
        grid-column: span 4;
      }

      .hero-topbar {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border: 2px solid currentColor;
        background: rgba(0, 0, 0, 0.18);
        color: var(--gold);
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 12px;
      }

      .eyebrow::before {
        content: "";
        width: 10px;
        height: 10px;
        background: currentColor;
      }

      .locale-switch-wrap {
        display: grid;
        justify-items: end;
        gap: 10px;
      }

      .locale-switch-label {
        color: var(--muted);
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .locale-switch {
        display: inline-flex;
        gap: 8px;
      }

      .locale-button {
        min-width: 68px;
        height: 38px;
        border: 2px solid var(--line);
        background: rgba(0, 0, 0, 0.18);
        color: var(--muted);
        cursor: pointer;
        transition: transform 120ms ease;
      }

      .locale-button:hover {
        transform: translate(-1px, -1px);
      }

      .locale-button.is-active {
        border-color: currentColor;
        background: var(--panel-strong);
        color: var(--ink);
        box-shadow: 4px 4px 0 var(--shadow);
      }

      .hero-title {
        margin: 18px 0 10px;
        font-size: clamp(40px, 8vw, 76px);
        line-height: 0.92;
        letter-spacing: -0.06em;
      }

      .hero-copy {
        max-width: 60ch;
        color: var(--muted);
        font-size: 15px;
        line-height: 1.8;
      }

      .stat-row {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-top: 22px;
      }

      .stat-chip {
        border: 2px solid var(--line);
        background: var(--panel-strong);
        padding: 14px;
      }

      .stat-value {
        display: block;
        color: var(--ink);
        font-size: 14px;
        font-weight: 700;
      }

      .stat-label {
        display: block;
        margin-top: 8px;
        color: var(--muted);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      .tile-topline {
        margin-bottom: 12px;
        color: currentColor;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
      }

      .tile-copy {
        margin: 0 0 16px;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.7;
      }

      .command-stack {
        display: grid;
        gap: 12px;
      }

      .command-line {
        display: block;
        padding: 14px 16px;
        overflow-x: auto;
        border: 2px solid var(--line);
        background: #0e1716;
        color: var(--ink);
        line-height: 1.7;
        font-size: 12px;
      }

      .mini-grid {
        display: grid;
        gap: 12px;
      }

      .info-panel {
        margin-top: 14px;
        border: 2px solid var(--line);
        background: var(--panel-soft);
        padding: 14px;
      }

      .info-panel-title {
        margin: 0 0 10px;
        color: currentColor;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      .info-panel-copy {
        margin: 0 0 12px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.7;
      }

      .mini-panel {
        border: 2px solid var(--line);
        background: var(--panel-soft);
        padding: 14px;
      }

      .mini-panel h3 {
        margin: 0 0 10px;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .mini-panel p {
        margin: 0;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.7;
      }

      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .tag {
        padding: 8px 10px;
        border: 2px solid var(--line);
        background: rgba(0, 0, 0, 0.18);
        color: var(--ink);
        font-size: 13px;
      }

      .resource-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
      }

      .resource-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 150px;
      }

      .resource-title {
        font-size: 22px;
        line-height: 1.1;
      }

      .resource-note {
        color: var(--muted);
        line-height: 1.8;
        font-size: 14px;
      }

      .cta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
      }

      .cta-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
        padding: 0 16px;
        border: 2px solid currentColor;
        background: rgba(0, 0, 0, 0.18);
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        box-shadow: 4px 4px 0 var(--shadow);
      }

      .accent-gold {
        color: var(--gold);
      }

      .accent-mint {
        color: var(--mint);
      }

      .accent-coral {
        color: var(--coral);
      }

      .accent-lime {
        color: var(--lime);
      }

      .accent-sky {
        color: var(--sky);
      }

      @keyframes tile-in {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 960px) {
        .hero,
        .span-12,
        .span-7,
        .span-6,
        .span-5,
        .span-4 {
          grid-column: span 12;
        }

        .stat-row,
        .resource-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .shell {
          width: min(100vw - 18px, 1180px);
          padding: 16px 0 28px;
        }

        .mosaic {
          gap: 14px;
        }

        .tile,
        .resource-card {
          padding: 18px;
          box-shadow: 6px 6px 0 var(--shadow);
        }

        .hero-topbar {
          flex-direction: column;
        }

        .locale-switch-wrap {
          justify-items: start;
        }

        .hero-title {
          font-size: 34px;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="mosaic">
        <header class="tile hero accent-gold" style="--tile-delay:0ms">
          <div class="hero-topbar">
            <div class="eyebrow">${renderLocalizedText(heroEyebrow)}</div>
            ${renderLocaleSwitcher()}
          </div>
          <h1 class="hero-title">${escapeHtml(heroTitle)}</h1>
          <p class="hero-copy">${renderLocalizedText(heroDescription)}</p>
          <div class="stat-row">
            ${heroStats.map((stat) => renderStat(stat.value, stat.label)).join("\n")}
          </div>
          <div class="cta-row accent-gold">
            <a class="cta-link" href="/SKILL.md">${renderLocalizedText(ctaOpenSkill)}</a>
            <a class="cta-link" href="https://code.byted.org/byteapi/bytedcli" target="_blank" rel="noreferrer noopener">${renderLocalizedText(ctaOpenRepo)}</a>
          </div>
        </header>

        <section class="tile span-6 accent-coral" style="--tile-delay:140ms">
          <div class="tile-topline">${renderLocalizedText(quickStartTitle)}</div>
          <p class="tile-copy">${renderLocalizedText(quickStartCopy)}</p>
          <div class="command-stack">
            ${quickCommands.map((command) => renderCommand(command)).join("\n")}
          </div>
          <div class="info-panel accent-mint">
            <h3 class="info-panel-title">${renderLocalizedText(quickCurlHintTitle)}</h3>
            <p class="info-panel-copy">${renderLocalizedText(quickCurlHintCopy)}</p>
            ${renderCurlCommand()}
          </div>
        </section>

        <section class="tile span-6 accent-sky" style="--tile-delay:180ms">
          <div class="tile-topline">${renderLocalizedText(howToUseTitle)}</div>
          <p class="tile-copy">${renderLocalizedText(howToUseCopy)}</p>
          <div class="mini-grid">
            ${renderAccessModes()}
          </div>
        </section>

        ${renderCapabilityCards()}

        <section class="tile span-12 accent-sky" style="--tile-delay:500ms">
          <div class="tile-topline">${renderLocalizedText(resourcePathsTitle)}</div>
          <p class="tile-copy">${renderLocalizedText(resourcePathsCopy)}</p>
          <div class="resource-grid">
            ${renderResourceCards()}
          </div>
        </section>
      </section>
    </main>
    ${renderLocaleBootScript()}
  </body>
</html>
`;
}
