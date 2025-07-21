import { assertEquals } from "jsr:@std/assert";
import { handler } from "./router.js";

Deno.test(`${handler.name} returns 404 response if path doesn't exist`, async () => {
  const request = new Request(new URL("/does-not-exist", import.meta.url));
  const response = await handler(request);
  assertEquals(response.status, 404);
});

Deno.test(
  `${handler.name} returns 200 response if path exists`,
  async () => {
    const fileUrl = new URL("test-route.js", import.meta.url);
    const url = new URL("/test-route", import.meta.url);
    await Deno.writeTextFile(
      fileUrl,
      "export const GET = () => new Response('hello');",
    );
    const request = new Request(url);
    const response = await handler(request);
    await Deno.remove(fileUrl);
    assertEquals(response.status, 200);
  },
);
