import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import * as website from "../src/index.js";

test("isProbablyBrowserRequest distinguishes browser and curl user agents", () => {
  assert.equal(
    website.isProbablyBrowserRequest({
      userAgent: "curl/8.7.1",
      accept: "*/*",
    }),
    false
  );

  assert.equal(
    website.isProbablyBrowserRequest({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    }),
    true
  );
});

test("resolveWebsiteResponse sends markdown to non-browser requests", () => {
  const response = website.resolveWebsiteResponse(
    {
      pathname: "/",
      headers: {
        accept: "*/*",
        "user-agent": "curl/8.7.1",
      },
    },
    {
      html: "<html>landing</html>",
      markdown: "# Skill Guide\n",
    }
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.contentType, "text/markdown; charset=utf-8");
  assert.equal(response.body, "# Skill Guide\n");
});

test("resolveWebsiteResponse sends markdown for /SKILL.md even in browsers", () => {
  const response = website.resolveWebsiteResponse(
    {
      pathname: "/SKILL.md/",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    },
    {
      html: "<html>landing</html>",
      markdown: "# Skill Guide\n",
    }
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.contentType, "text/markdown; charset=utf-8");
  assert.equal(response.body, "# Skill Guide\n");
});

test("resolveWebsiteResponse sends html to browser paths other than /SKILL.md", () => {
  const response = website.resolveWebsiteResponse(
    {
      pathname: "/platforms/codebase",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    },
    {
      html: "<html>landing</html>",
      markdown: "# Skill Guide\n",
    }
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.contentType, "text/html; charset=utf-8");
  assert.equal(response.body, "<html>landing</html>");
});

test("resolveWebsiteResponse rejects unsupported methods", () => {
  const response = website.resolveWebsiteResponse(
    {
      method: "POST",
      pathname: "/",
    },
    {
      html: "<html>landing</html>",
      markdown: "# Skill Guide\n",
    }
  );

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers?.Allow, "GET, HEAD");
});

test("buildWebsiteSite writes SSR preview package and english markdown guide", async () => {
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "bytedcli-website-site-"));

  try {
    const result = await website.buildWebsiteSite({
      outDir,
      skillMarkdown: "# Demo Skill\n",
    });

    assert.deepEqual(
      [...result.files].sort(),
      ["deploy.yml", "html/main/index.html", "SKILL.md"].sort()
    );

    const [deployYaml, nestedHtml, skillMarkdown, previewServer, previewPackage] = await Promise.all([
      fs.readFile(path.join(outDir, "deploy.yml"), "utf8"),
      fs.readFile(path.join(outDir, "html", "main", "index.html"), "utf8"),
      fs.readFile(path.join(outDir, "SKILL.md"), "utf8"),
      fs.readFile(path.join(outDir, "worker-server", "index.js"), "utf8"),
      fs.readFile(path.join(outDir, "worker-server", "package.json"), "utf8"),
    ]);

    assert.match(deployYaml, /script: node worker-server\/index\.js/);
    assert.match(deployYaml, /src: \/SKILL\.md/);
    assert.match(deployYaml, /ssr: true/);
    assert.match(nestedHtml, /bytedcli/);
    assert.match(nestedHtml, /ByteDance Internal CLI/);
    assert.match(nestedHtml, /字节研发命令行/);
    assert.match(nestedHtml, /supported commands/);
    assert.match(nestedHtml, /支持的命令/);
    assert.match(nestedHtml, /data-locale-switch="zh"/);
    assert.match(nestedHtml, /data:image\/png;base64,/);
    assert.match(nestedHtml, /meta name="application-name" content="bytedcli"/);
    assert.match(nestedHtml, /meta name="theme-color" content="#0d1413"/);
    assert.match(nestedHtml, /meta property="og:title"/);
    assert.match(nestedHtml, /meta property="og:description"/);
    assert.match(nestedHtml, /meta name="twitter:card" content="summary"/);
    assert.match(nestedHtml, /application\/ld\+json/);
    assert.doesNotMatch(nestedHtml, /uppercase Markdown guide aliases/);
    assert.match(nestedHtml, /Open \/SKILL\.md/);
    assert.match(nestedHtml, /@bytedance-dev\/bytedcli@latest --help/);
    assert.match(nestedHtml, /@bytedance-dev\/bytedcli@latest auth login/);
    assert.match(nestedHtml, /Markdown via curl/);
    assert.match(nestedHtml, /通过 curl 获取 Markdown/);
    assert.match(nestedHtml, /curl <span data-runtime-origin>/);
    assert.equal(skillMarkdown, "# Demo Skill\n");
    assert.match(previewServer, /resolveWebsiteResponse/);
    assert.equal(previewPackage, '{\n  "type": "module"\n}\n');
  } finally {
    await fs.rm(outDir, { recursive: true, force: true });
  }
});
