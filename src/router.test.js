import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { createRouter } from "./router.js";

describe(createRouter.name, () => {
  describe("use", () => {
    it("should execute multiple middlewares in the order they are added", async () => {
      const router = createRouter();
      /** @type {number[]} */
      const nums = [];
      router.use({
        handler: (ctx) => {
          nums.push(1);
          return ctx.next();
        },
      });
      router.use({
        handler: (ctx) => {
          nums.push(2);
          return ctx.next();
        },
      });
      router.use({
        handler: () => {
          nums.push(3);
          return new Response("hello");
        },
      });

      const response = await router.handle(
        new Request("http://localhost:8000"),
      );

      assertEquals(nums, [1, 2, 3]);
      assertEquals(response.status, 200);
    });

    it("should execute middleware for all HTTP methods", async () => {
      let count = 0;
      const router = createRouter();
      router.use({
        path: "/test",
        handler: (ctx) => {
          count++;
          return ctx.next();
        },
      });
      router.get({
        path: "/test",
        handler: () => new Response(),
      });
      router.post({
        path: "/test",
        handler: () => new Response(),
      });
      router.put({
        path: "/test",
        handler: () => new Response(),
      });
      router.patch({
        path: "/test",
        handler: () => new Response(),
      });
      router.delete({
        path: "/test",
        handler: () => new Response(),
      });
      const getRequest = new Request("http://localhost:8000/test", {
        method: "GET",
      });
      const postRequest = new Request("http://localhost:8000/test", {
        method: "POST",
      });
      const putRequest = new Request("http://localhost:8000/test", {
        method: "PUT",
      });
      const patchRequest = new Request("http://localhost:8000/test", {
        method: "PATCH",
      });
      const deleteRequest = new Request("http://localhost:8000/test", {
        method: "DELETE",
      });

      await router.handle(getRequest);
      await router.handle(postRequest);
      await router.handle(putRequest);
      await router.handle(patchRequest);
      await router.handle(deleteRequest);

      assertEquals(count, 5);
    });

    it("should allow a middleware to add properties to the request object", async () => {
      /** @type {string[]} */
      const data = [];
      const router = createRouter();
      router.use({
        handler: (ctx) => {
          ctx.state.test = "abc";
          return ctx.next();
        },
      });
      router.use({
        handler: (ctx) => {
          data.push(ctx.state.test);
          return ctx.next();
        },
      });
      router.get({
        path: "/",
        handler: (ctx) => {
          data.push(ctx.state.test);
          return new Response();
        },
      });

      await router.handle(new Request("http://localhost:8000"));

      assertEquals(data, ["abc", "abc"]);
    });

    it("should pass control to the next middleware when next() is called", async () => {
      let nextWorks = false;
      const router = createRouter();
      router.use({
        handler: (ctx) => {
          return ctx.next();
        },
      });
      router.use({
        handler: () => {
          nextWorks = true;
          return new Response();
        },
      });

      await router.handle(new Request("http://localhost"));

      assertEquals(nextWorks, true);
    });

    it("should allow a middleware to end the request-response cycle", async () => {
      let isNextCalled = false;
      const router = createRouter();
      router.use({
        handler: () => {
          return new Response();
        },
      });
      router.use({
        handler: (ctx) => {
          isNextCalled = true;
          return ctx.next();
        },
      });
      router.get({
        path: "/",
        handler: () => {
          isNextCalled = true;
          return new Response();
        },
      });

      await router.handle(new Request("http://localhost"));

      assertEquals(isNextCalled, false);
    });

    it("should only execute middleware if the request path matches the middleware path prefix", async () => {
      let isTestMiddlewareCalled = false;
      const router = createRouter();
      router.use({
        path: "/test",
        handler: (ctx) => {
          isTestMiddlewareCalled = true;
          return ctx.next();
        },
      });
      router.get({
        path: "/test",
        handler: () => {
          return new Response();
        },
      });
      router.get({
        path: "/test2",
        handler: () => {
          return new Response();
        },
      });

      await router.handle(new Request("http://localhost/test2"));
      assertEquals(isTestMiddlewareCalled, false);
      await router.handle(new Request("http://localhost/test"));
      assertEquals(isTestMiddlewareCalled, true);
    });

    it("should correctly handle path parameters in middleware routes", async () => {
      let params;
      const router = createRouter();
      router.use({
        path: "/test/:id",
        handler: (ctx) => {
          params = { ...ctx.params };
          return new Response();
        },
      });

      await router.handle(new Request("http://localhost/test/123"));

      assertEquals(params, { id: "123" });
    });
  });

  describe("GET", () => {
    it("should give a response to a given GET request path", async () => {
      const router = createRouter();
      router.get({
        path: "/test",
        handler: () => new Response("hello"),
      });

      const response = await router.handle(
        new Request("http://localhost/test", { method: "GET" }),
      );

      assertEquals(await response.text(), "hello");
    });

    it("should give a 404 response for a non-existing path", async () => {
      const router = createRouter();
      router.get({
        path: "/",
        handler: () => new Response("hello"),
      });

      const response = await router.handle(
        new Request("http://localhost/test", { method: "GET" }),
      );

      assertEquals(response.status, 404);
    });

    it("should give a 404 response for a non-GET request path", async () => {
      const router = createRouter();
      router.post({
        path: "/test",
        handler: () => new Response("hello"),
      });

      const response = await router.handle(
        new Request("http://localhost/test", { method: "GET" }),
      );

      assertEquals(response.status, 404);
    });

    it("should be able to accept path params", async () => {
      let params;
      const router = createRouter();
      router.get({
        path: "/test/:id",
        handler: (ctx) => {
          params = { ...ctx.params };
          return new Response();
        },
      });

      await router.handle(
        new Request("http://localhost/test/123", { method: "GET" }),
      );

      assertEquals(params, { id: "123" });
    });
  });

  describe("POST", () => {
    // TODO
  });

  describe("PUT", () => {
    // TODO
  });

  describe("PATCH", () => {
    // TODO
  });

  describe("DELETE", () => {
    // TODO
  });
});
