import { type Route } from "../types.ts";

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

const serveStatic = <AppState>(
  { path, base }: { path: string; base: string | URL },
): Route<AppState> => {
  const trimmedPath = path.endsWith("/") ? path.slice(0, -1) : path;

  return {
    path: trimmedPath + "/:subdir*/:filename",
    method: "GET",
    handler: async (ctx) => {
      const { subdir, filename } = ctx.params;
      if (!filename) throw new Error("Missing filename.");

      const filepath = new URL(
        `.${trimmedPath}/${subdir ? subdir + "/" : ""}${filename}`,
        base,
      );
      const mime =
        Object.entries(MIME_TYPES).find(([extension]) =>
          filename.endsWith(extension)
        )?.[1] ?? MIME_TYPES[".txt"];

      try {
        const file = await Deno.readFile(filepath);
        return new Response(file, {
          headers: { "Content-Type": mime },
        });
      } catch (_error) {
        return new Response("File not found", { status: 404 });
      }
    },
  };
};

export { MIME_TYPES, serveStatic };
