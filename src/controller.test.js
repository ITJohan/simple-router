import { deepStrictEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import { createController } from "./controller.js";

describe("Controller", () => {
	describe("handle", () => {
		const testController = createController({
			GET: () => {
				return new Response("hello");
			},
			POST: () => {
				throw new Error("crash");
			}
		});

		it("should take a request and dispatch it to the appropriate method", async () => {
			const response = await testController({
				request: new Request("http://test/", { method: "GET" }),
				params: {},
				state: {},
				next: () => new Response(),
			});

			deepStrictEqual(await response.text(), "hello");
		});

		it("should return a 405 method not allowed for a method that does not exist", async () => {
			const response = await testController({
				request: new Request("http://test/", { method: "PUT" }),
				params: {},
				state: {},
				next: () => new Response(),
			});

			deepStrictEqual(response.status, 405);
			deepStrictEqual(await response.text(), "Method not allowed");
		});

		it("should return 500 internal error if exceptional error is thrown", async () => {
			const response = await testController({
				request: new Request("http://test/", { method: "POST" }),
				params: {},
				state: {},
				next: () => new Response(),
			});

			deepStrictEqual(response.status, 500);
			deepStrictEqual(await response.text(), "Internal error");
		});
	});
});
