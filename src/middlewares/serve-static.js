/** @import { Route } from "../types.ts" */
import { readFile } from "node:fs/promises";

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

/**
 * @template AppState
 * @param {Object} options
 * @param {string} options.path
 * @param {string | URL} options.base
 * @returns {Route<AppState>}
 */
const serveStatic = ({ path, base }) => {
	const trimmedPath = path.endsWith("/") ? path.slice(0, -1) : path;

	return {
		path: `${trimmedPath}/:subdir*/:filename`,
		method: "GET",
		handler: async (ctx) => {
			const { subdir, filename } = ctx.params;

			if (!filename) {
				return new Response("Missing filename.", { status: 400 });
			}

			const fileUrl = new URL(
				`.${trimmedPath}/${subdir ? `${subdir}/` : ""}${filename}`,
				base,
			);

			const extension = /** @type {keyof MIME_TYPES} */ (
				filename.slice(filename.lastIndexOf("."))
			);
			const mime = MIME_TYPES[extension] ?? MIME_TYPES[".txt"];

			try {
				const file = await readFile(fileUrl);
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
