/** @import { RouterConfig } from "./router.js" */

import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertInstanceOf } from "@std/assert";
import { createRouter } from "./router.js";

describe("createRouter", () => {
  it("should return a route function given a route config", () => {
    /** @type {RouterConfig} */
    const routerConfig = [
      {
        pattern: new URLPattern({ pathname: "/" }),
        route: () => Promise.resolve(new Response("hello world")),
      },
    ];
    const route = createRouter(routerConfig);

    assertInstanceOf(route, Function);
  });

  it("should have its returned function return a response given a request for a route", async () => {
    /** @type {RouterConfig} */
    const routerConfig = [
      {
        pattern: new URLPattern({ pathname: "/test" }),
        route: () => Promise.resolve(new Response("hello world")),
      },
    ];
    const route = createRouter(routerConfig);
    const request = new Request(new URL("http://localhost/test"));
    const response = await route(request);

    assertInstanceOf(response, Response);
  });

  it("should have its returned function return a 404 response if no route exist for a given request", async () => {
    /** @type {RouterConfig} */
    const routerConfig = [
      {
        pattern: new URLPattern({ pathname: "/test" }),
        route: () => Promise.resolve(new Response("hello world")),
      },
    ];
    const route = createRouter(routerConfig);
    const request = new Request(new URL("http://localhost/do-not-exist"));
    const response = await route(request);

    assertEquals(response.status, 404);
  });

  it("should support url params", () => {
    // TODO
  });
});
