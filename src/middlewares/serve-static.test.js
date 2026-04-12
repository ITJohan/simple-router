import { deepStrictEqual } from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { createRouter } from "../router.js";
import { MIME_TYPES, serveStatic } from "./serve-static.js";

describe("serveStatic", () => {
	it("should serve all supported MIME file types from the specified static folder", async () => {
		const dirpath = new URL("./static/", import.meta.url);

		const router = createRouter({
			routes: [serveStatic({ path: "/static", base: import.meta.url })],
			initialState: () => ({}),
		});

		await mkdir(dirpath, { recursive: true });

		try {
			for (const [extension, mime] of Object.entries(MIME_TYPES)) {
				const filepath = new URL(`./static/file${extension}`, import.meta.url);

				await writeFile(filepath, "hello");

				const request = new Request(
					`http://localhost/static/file${extension}`,
					{ method: "GET" },
				);

				const response = await router.handle(request);

				deepStrictEqual(await response.text(), "hello");
				deepStrictEqual(response.headers.get("Content-Type"), mime);
			}
		} finally {
			await rm(dirpath, { recursive: true, force: true });
		}
	});

	it("should respond with 404 if file not found", async () => {
		const router = createRouter({
			routes: [serveStatic({ path: "/static", base: import.meta.url })],
			initialState: () => ({}),
		});

		const request = new Request("http://localhost/static/nonexisting.txt");
		const response = await router.handle(request);

		deepStrictEqual(response.status, 404);
	});

	it("should be able to service files from nested directories", async () => {
		const baseDirpath = new URL("./static/", import.meta.url);
		const nestedDirpath = new URL("./static/assets/", import.meta.url);
		const filepath = new URL("./static/assets/image.jpg", import.meta.url);

		await mkdir(nestedDirpath, { recursive: true });
		await writeFile(filepath, "hello");

		const router = createRouter({
			routes: [serveStatic({ path: "/static", base: import.meta.url })],
			initialState: () => ({}),
		});

		try {
			const request = new Request("http://localhost/static/assets/image.jpg");
			const response = await router.handle(request);

			deepStrictEqual(await response.text(), "hello");
		} finally {
			await rm(baseDirpath, { recursive: true, force: true });
		}
	});

	it("should enforce the filter function and return 403 for disallowed files", async () => {
		const dirpath = new URL("./static/", import.meta.url);
		const allowedFilepath = new URL("./static/style.css", import.meta.url);
		const forbiddenFilepath = new URL("./static/controller.js", import.meta.url);

		await mkdir(dirpath, { recursive: true });
		await writeFile(allowedFilepath, "css-content");
		await writeFile(forbiddenFilepath, "secret-code");

		const router = createRouter({
			routes: [
				serveStatic({
					path: "/static",
					base: import.meta.url,
					filter: (filename) => filename.endsWith(".css"),
				}),
			],
			initialState: () => ({}),
		});

		try {
			const allowedRequest = new Request("http://localhost/static/style.css");
			const allowedResponse = await router.handle(allowedRequest);

			deepStrictEqual(allowedResponse.status, 200);
			deepStrictEqual(await allowedResponse.text(), "css-content");

			const forbiddenRequest = new Request("http://localhost/static/controller.js");
			const forbiddenResponse = await router.handle(forbiddenRequest);

			deepStrictEqual(forbiddenResponse.status, 403);
			deepStrictEqual(await forbiddenResponse.text(), "Forbidden");
		} finally {
			await rm(dirpath, { recursive: true, force: true });
		}
	});
});
