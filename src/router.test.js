import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { createRouter } from "./router.js";

describe(createRouter.name, () => {
  it("should call a route specified in a config", async () => {
    const { handle } = createRouter({
      routes: [
        {
          path: "/endpoint",
          method: "GET",
          handler: () => new Response("hello"),
        },
      ],
      initialState: () => ({}),
    });
    const request = new Request("http://localhost/endpoint", { method: "GET" });
    const response = await handle(request);
    assertEquals(await response.text(), "hello");
  });

  it("should return a 404 response for a non-existing route", async () => {
    const { handle } = createRouter({
      routes: [
        {
          path: "/endpoint",
          method: "GET",
          handler: () => new Response("hello"),
        },
      ],
      initialState: () => ({}),
    });
    const request = new Request("http://localhost/nonexistent", {
      method: "GET",
    });
    const response = await handle(request);
    assertEquals(response.status, 404);
  });

  it("should call routes in the order specified in the config", async () => {
    /** @type {string[]} */
    let callOrder = [];
    const { handle } = createRouter({
      routes: [
        {
          path: "/endpoint",
          method: "GET",
          handler: (ctx) => {
            callOrder = [...callOrder, "middleware"];
            return ctx.next();
          },
        },
        {
          path: "/endpoint",
          method: "GET",
          handler: () => {
            callOrder = [...callOrder, "route"];
            return new Response("hello");
          },
        },
      ],
      initialState: () => ({}),
    });
    const request = new Request("http://localhost/endpoint", {
      method: "GET",
    });
    await handle(request);
    assertEquals(callOrder, ["middleware", "route"]);
  });

  it("should only call the routes for the requested method", async () => {
    const { handle } = createRouter({
      routes: [
        {
          path: "/endpoint",
          method: "POST",
          handler: () => new Response("post"),
        },
        {
          path: "/endpoint",
          method: "GET",
          handler: () => new Response("get"),
        },
      ],
      initialState: () => ({}),
    });
    const request = new Request("http://localhost/endpoint", { method: "GET" });
    const response = await handle(request);
    assertEquals(await response.text(), "get");
  });

  it("should support params in the path", async () => {
    let params;
    const { handle } = createRouter({
      routes: [
        {
          path: "/endpoint/:id",
          method: "GET",
          handler: (ctx) => {
            params = { ...ctx.params };
            return new Response("hello");
          },
        },
      ],
      initialState: () => ({}),
    });
    const request = new Request("http://localhost/endpoint/123", {
      method: "GET",
    });
    await handle(request);
    assertEquals(params, { id: "123" });
  });

  it("should support state in context", async () => {
    let hello;
    const { handle } = createRouter({
      routes: [
        {
          path: "/endpoint",
          method: "GET",
          handler: (ctx) => {
            hello = ctx.state.hello;
            return new Response();
          },
        },
      ],
      initialState: () => ({ hello: "world" }),
    });
    const request = new Request("http://localhost/endpoint", {
      method: "GET",
    });
    await handle(request);
    assertEquals(hello, "world");
  });
});
