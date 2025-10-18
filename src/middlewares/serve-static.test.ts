import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { MIME_TYPES, serveStatic } from "./serve-static.ts";
import { Router } from "../router.ts";

describe(serveStatic.name, () => {
  it("should serve all supported MIME file types from the specified static folder", async () => {
    const dirpath = new URL("./static/", import.meta.url);
    const router = new Router({
      routes: [
        serveStatic({ path: "/static", base: import.meta.url }),
      ],
      initialState: () => ({}),
    });
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

        const response = await router.handle(request);

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
    const router = new Router({
      routes: [
        serveStatic({ path: "/static", base: import.meta.url }),
      ],
      initialState: () => ({}),
    });
    const request = new Request("http://localhost/static/nonexisting.txt");
    const response = await router.handle(request);

    assertEquals(response.status, 404);
  });

  it("should be able to service files from nested directories", async () => {
    const baseDirpath = new URL("./static", import.meta.url);
    const nestedDirpath = new URL("./static/assets", import.meta.url);
    const filepath = new URL(`./static/assets/image.jpg`, import.meta.url);
    await Deno.mkdir(baseDirpath);
    await Deno.mkdir(nestedDirpath);
    await Deno.writeFile(filepath, new TextEncoder().encode("hello"));
    const router = new Router({
      routes: [
        serveStatic({ path: "/static", base: import.meta.url }),
      ],
      initialState: () => ({}),
    });
    const request = new Request("http://localhost/static/assets/image.jpg");
    const response = await router.handle(request);
    await Deno.remove(baseDirpath, { recursive: true });

    assertEquals(await response.text(), "hello");
  });
});
