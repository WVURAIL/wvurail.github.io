import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { PurgeCSS } from "purgecss";

async function contentFiles(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) files.push(...await contentFiles(path));
    else if (/\.(html|js)$/.test(item.name)) files.push(path);
  }
  return files;
}

export async function trimStyles(site, paths = ["assets/wvu-design-system/site.min.css", "dspira/assets/wvu-design-system/site.min.css"]) {
  const files = await contentFiles(site);
  if (!files.some(path => path.endsWith(".html"))) {
    throw new Error("No built HTML pages found");
  }
  const content = await Promise.all(files.map(async path => {
    const extension = extname(path).slice(1);
    const raw = await readFile(path, "utf8");
    // Embedded notebook styles are not evidence that a page uses those classes.
    return { extension, raw: extension === "html" ? raw.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "") : raw };
  }));
  const css = await Promise.all(paths.map(async path => ({ raw: await readFile(join(site, path), "utf8") })));
  const results = await new PurgeCSS().purge({
    content,
    css,
    // Keep menu and filter states, including states absent from the initial HTML.
    safelist: { greedy: [/^(js-|is-)/, /^wvu-site-nav/, /^(active|show|open|collapse|collapsing)$/] },
    dynamicAttributes: ["aria-expanded", "aria-current", "hidden"],
    fontFace: false,
    keyframes: false,
    variables: false,
  });
  for (let i = 0; i < paths.length; i++) {
    await writeFile(join(site, paths[i]), results[i].css);
    console.log(`${paths[i]}: ${Buffer.byteLength(css[i].raw)} -> ${Buffer.byteLength(results[i].css)} bytes`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await trimStyles(resolve(process.argv[2] || "_site"), process.argv.length > 3 ? process.argv.slice(3) : undefined);
}
