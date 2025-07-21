import { assertEquals } from "jsr:@std/assert";
import { handler } from "./router.js";

Deno.test(`${handler.name} returns 404 response if path doesn't exist`, async () => {
  const request = new Request(new URL("/does-not-exist", import.meta.url));
  const response = await handler(request);
  assertEquals(response.status, 404);
});

Deno.test(
  `${handler.name} returns 200 response for a route with an implemented method`,
  async () => {
    const routeName = crypto.randomUUID();
    const fileUrl = new URL(`${routeName}.js`, import.meta.url);
    const url = new URL(`/${routeName}`, import.meta.url);
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

Deno.test(`${handler.name} returns 501 response for an existing route with missing method`, async () => {
  const routeName = crypto.randomUUID();
  const fileUrl = new URL(`${routeName}.js`, import.meta.url);
  const url = new URL(`/${routeName}`, import.meta.url);
  await Deno.writeTextFile(
    fileUrl,
    "export const POST = () => new Response('hello');",
  );
  const request = new Request(url);
  const response = await handler(request);
  await Deno.remove(fileUrl);
  assertEquals(response.status, 501);
});
