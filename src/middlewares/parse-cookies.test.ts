import { describe, it } from "@std/testing/bdd";
import { parseCookies } from "./parse-cookies.ts";
import { Router } from "../router.ts";
import { assertEquals } from "@std/assert";
import type { CookiesState } from "../types.ts";

describe(parseCookies.name, () => {
  it("should parse the cookie header and make the cookies available in the state", async () => {
    const state: CookiesState = { cookies: {} };
    const router = new Router({
      routes: [
        {
          path: "/",
          method: "GET",
          handler: parseCookies,
        },
      ],
      initialState: () => state,
    });
    const request = new Request("http://test.com/", {
      headers: {
        "Cookie": "a=1; b=2; c=3",
      },
    });

    await router.handle(request);

    assertEquals(state.cookies, {
      a: "1",
      b: "2",
      c: "3",
    });
  });

  it("should keep the empty object on the cookies state if no cookie header", async () => {
    const state: CookiesState = { cookies: {} };
    const router = new Router({
      routes: [
        {
          path: "/",
          method: "GET",
          handler: parseCookies,
        },
      ],
      initialState: () => state,
    });
    const request = new Request("http://test.com/");

    await router.handle(request);

    assertEquals(state.cookies, {});
  });
});
