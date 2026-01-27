import { deepStrictEqual } from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { Router } from "../router.js";
import { MIME_TYPES, serveStatic } from "./serve-static.js";

describe("serveStatic", () => {
	it("should serve all supported MIME file types from the specified static folder", async () => {
		const dirpath = new URL("./static/", import.meta.url);

		const router = new Router({
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
		const router = new Router({
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

		const router = new Router({
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
});
