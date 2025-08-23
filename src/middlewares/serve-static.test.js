import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { MIME_TYPES, serveStatic } from "./serve-static.js";
import { createRouter } from "../router.js";

describe(serveStatic.name, () => {
  it("should serve all supported MIME file types from the specified static folder", async () => {
    const dirpath = new URL("./static/", import.meta.url);
    const { handle } = createRouter([
      serveStatic({ path: "/static", base: import.meta.url }),
    ]);
    await Deno.mkdir(dirpath);

    try {
      for await (const [extension, mime] of Object.entries(MIME_TYPES)) {
        const filepath = new URL(`./static/file${extension}`, import.meta.url);
        await Deno.writeFile(filepath, new TextEncoder().encode("hello"));
        const request = new Request(
          `http://localhost/static/file${extension}`,
          {
            method: "GET",
          },
        );

        const response = await handle(request);

        assertEquals(await response.text(), "hello");
        assertEquals(
          response.headers.get("Content-Type"),
          mime,
        );
      }
    } finally {
      await Deno.remove(dirpath, { recursive: true });
    }
  });

  it("should respond with 404 if file not found", async () => {
    const { handle } = createRouter([
      serveStatic({ path: "/static", base: import.meta.url }),
    ]);
    const request = new Request("http://localhost/static/nonexisting.txt");
    const response = await handle(request);

    assertEquals(response.status, 404);
  });

  it("should be able to service files from nested directories", async () => {
    const baseDirpath = new URL("./static", import.meta.url);
    const nestedDirpath = new URL("./static/assets", import.meta.url);
    const filepath = new URL(`./static/assets/image.jpg`, import.meta.url);
    await Deno.mkdir(baseDirpath);
    await Deno.mkdir(nestedDirpath);
    await Deno.writeFile(filepath, new TextEncoder().encode("hello"));
    const { handle } = createRouter([
      serveStatic({ path: "/static", base: import.meta.url }),
    ]);
    const request = new Request("http://localhost/static/assets/image.jpg");
    const response = await handle(request);
    await Deno.remove(baseDirpath, { recursive: true });

    assertEquals(await response.text(), "hello");
  });
});
