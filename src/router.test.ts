import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { Router } from "./router.ts";

describe(Router.name, () => {
  describe("handle", () => {
    it("should call a route specified in a config", async () => {
      const router = new Router({
        routes: [
          {
            path: "/endpoint",
            method: "GET",
            handler: () => new Response("hello"),
          },
        ],
        initialState: () => ({}),
      });
      const request = new Request("http://localhost/endpoint", {
        method: "GET",
      });
      const response = await router.handle(request);
      assertEquals(await response.text(), "hello");
    });

    it("should return a 404 response for a non-existing route", async () => {
      const router = new Router({
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
      const response = await router.handle(request);
      assertEquals(response.status, 404);
    });

    it("should call routes in the order specified in the config", async () => {
      let callOrder: string[] = [];
      const router = new Router({
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
      await router.handle(request);
      assertEquals(callOrder, ["middleware", "route"]);
    });

    it("should only call the routes for the requested method", async () => {
      const router = new Router({
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
      const request = new Request("http://localhost/endpoint", {
        method: "GET",
      });
      const response = await router.handle(request);
      assertEquals(await response.text(), "get");
    });

    it("should support params in the path", async () => {
      let params;
      const router = new Router({
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
      await router.handle(request);
      assertEquals(params, { id: "123" });
    });

    it("should support state in context", async () => {
      let hello;
      const router = new Router({
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
      await router.handle(request);
      assertEquals(hello, "world");
    });
  });
});
