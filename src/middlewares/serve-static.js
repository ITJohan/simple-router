/** @import {ConfigRoute} from "../types.js" */

const MIME_TYPES = Object.freeze({
  ".js": "text/javascript;charset=UTF-8",
  ".mjs": "text/javascript;charset=UTF-8",
  ".json": "application/json;charset=UTF-8",
  ".txt": "text/plain;charset=UTF-8",
  ".html": "text/html;charset=UTF-8",
  ".css": "text/css;charset=UTF-8",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml;charset=UTF-8",
  ".woff2": "font/woff2",
});

/** @type {(path: string) => ConfigRoute} */
const serveStatic = (path) => ({
  path: path.endsWith("/") ? `${path}:filename` : `${path}/:filename`,
  method: "GET",
  handler: async (ctx) => {
    const { filename } = ctx.params;
    const filepath = new URL(
      `.${path.endsWith("/") ? path : `${path}/`}${filename}`,
      import.meta.url,
    );
    const mime =
      Object.entries(MIME_TYPES).find(([extension]) =>
        filename?.endsWith(extension)
      )?.[1] ?? MIME_TYPES[".txt"];

    try {
      const file = await Deno.open(filepath, { read: true });
      return new Response(file.readable, {
        headers: { "Content-Type": mime },
      });
    } catch (_error) {
      return new Response("File not found", { status: 404 });
    }
  },
});

export { MIME_TYPES, serveStatic };
