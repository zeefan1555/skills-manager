import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderLandingPage } from "./render.js";

export interface BuildWebsiteSiteOptions {
  outDir?: string;
  skillMarkdown?: string;
}

export interface BuildWebsiteSiteResult {
  files: string[];
  outDir: string;
}

export async function buildWebsiteSite(
  options: BuildWebsiteSiteOptions = {}
): Promise<BuildWebsiteSiteResult> {
  const outDir = options.outDir ?? path.join(WEBSITE_ROOT, "site");
  const skillMarkdown = normalizeMarkdown(
    options.skillMarkdown ?? (await loadDefaultSkillMarkdown())
  );
  const html = renderLandingPage({
    faviconHref: await loadFaviconDataUrl(),
  });

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await mkdir(path.join(outDir, "html", "main"), { recursive: true });
  await mkdir(path.join(outDir, "worker-server"), { recursive: true });

  const previewDeployYaml = await loadTemplate("preview.deploy.yml");
  const fileMap = new Map<string, string>([
    ["deploy.yml", previewDeployYaml],
    [path.join("html", "main", "index.html"), html],
    ["SKILL.md", skillMarkdown],
  ]);

  for (const [fileName, content] of fileMap) {
    await writeFile(path.join(outDir, fileName), content, "utf8");
  }

  await writePreviewRuntime(outDir);

  return {
    outDir,
    files: [...fileMap.keys()],
  };
}

async function loadDefaultSkillMarkdown(): Promise<string> {
  const skillPath = path.join(WEBSITE_ROOT, "SKILL.md");
  return readFile(skillPath, "utf8");
}

async function loadFaviconDataUrl(): Promise<string> {
  const faviconPath = path.join(WEBSITE_ROOT, "bytedcli.png");
  const favicon = await readFile(faviconPath);
  return `data:image/png;base64,${favicon.toString("base64")}`;
}

function normalizeMarkdown(markdown: string): string {
  return markdown.endsWith("\n") ? markdown : `${markdown}\n`;
}

async function writePreviewRuntime(outDir: string): Promise<void> {
  const runtimeRoot = path.join(outDir, "worker-server");

  for (const fileName of ["browser.js", "preview-server.js", "response.js"]) {
    const sourcePath = path.join(getCompiledSourceDir(__dirname), fileName);
    const targetName = fileName === "preview-server.js" ? "index.js" : fileName;
    const content = await readFile(sourcePath, "utf8");
    await writeFile(path.join(runtimeRoot, targetName), content, "utf8");
  }

  await writeFile(
    path.join(runtimeRoot, "package.json"),
    await loadTemplate("worker-server.package.json"),
    "utf8"
  );
}

async function loadTemplate(fileName: string): Promise<string> {
  return readFile(path.join(WEBSITE_ROOT, "templates", fileName), "utf8");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEBSITE_ROOT = resolveWebsiteRoot(__dirname);

function resolveWebsiteRoot(currentDir: string): string {
  const parentDir = path.resolve(currentDir, "..");
  return path.basename(parentDir) === ".dist" ? path.dirname(parentDir) : parentDir;
}

function getCompiledSourceDir(currentDir: string): string {
  const parentDir = path.resolve(currentDir, "..");
  return path.basename(parentDir) === ".dist" ? currentDir : path.join(parentDir, ".dist", "src");
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  void buildWebsiteSite()
    .then((result) => {
      process.stdout.write(`Built website site assets in ${result.outDir}\n`);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      process.exitCode = 1;
    });
}
