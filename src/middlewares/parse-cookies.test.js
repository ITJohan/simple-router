/** @import { CookiesState } from "../types.js" */

import { deepStrictEqual } from "node:assert";
import { describe, it } from "node:test";
import { createRouter } from "../router.js";
import { parseCookies } from "./parse-cookies.js";

describe(parseCookies.name, () => {
	it("should parse the cookie header and make the cookies available in the state", async () => {
		/** @type {CookiesState} */
		const state = { cookies: {} };
		const router = createRouter({
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
				Cookie: "a=1; b=2; c=3",
			},
		});

		await router.handle(request);

		deepStrictEqual(state.cookies, {
			a: "1",
			b: "2",
			c: "3",
		});
	});

	it("should keep the empty object on the cookies state if no cookie header", async () => {
		/** @type {CookiesState} */
		const state = { cookies: {} };
		const router = createRouter({
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

		deepStrictEqual(state.cookies, {});
	});
});
