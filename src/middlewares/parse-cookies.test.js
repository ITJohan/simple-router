/** @import { CookiesState } from "../types.js" */

import { describe, it } from "@std/testing/bdd";
import { parseCookies } from "./parse-cookies.js";
import { createRouter } from "../router.js";
import { assertEquals } from "@std/assert";

describe(parseCookies.name, () => {
  it("should parse the cookie header and make the cookies available in the state", async () => {
    /** @type {CookiesState} */
    const state = { cookies: {} };
    const { handle } = createRouter({
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

    await handle(request);

    assertEquals(state.cookies, {
      a: "1",
      b: "2",
      c: "3",
    });
  });

  it("should keep the empty object on the cookies state if no cookie header", async () => {
    /** @type {CookiesState} */
    const state = { cookies: {} };
    const { handle } = createRouter({
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

    await handle(request);

    assertEquals(state.cookies, {});
  });
});
