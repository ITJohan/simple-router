/** @import {ConfigRoute} from "../types.js" */

const MIME_TYPES = Object.freeze({
  ".js": "application/javascript;charset=UTF-8",
  ".mjs": "text/javascript;charset=UTF-8",
  ".json": "text/json;charset=UTF-8",
  ".txt": "text/plain;charset=UTF-8",
  ".css": "text/css;charset=UTF-8",
  ".web": "image/webp;charset=UTF-8",
  ".jpg": "image/jpeg;charset=UTF-8",
  ".jpeg": "image/jpeg;charset=UTF-8",
  ".png": "image/png;charset=UTF-8",
  ".svg": "image/svg+xml;charset=UTF-8",
  ".woff2": "image/woff2;charset=UTF-8",
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
    const extension =
      Object.entries(MIME_TYPES).filter(([extension]) =>
        filename?.endsWith(extension)
      ).map(([_, mime]) => mime)[0];
    try {
      const file = await Deno.open(filepath, { read: true });
      return new Response(file.readable, {
        headers: { "Content-Type": extension },
      });
    } catch (_error) {
      return new Response("File not found", { status: 404 });
    }
  },
});

export { MIME_TYPES, serveStatic };
