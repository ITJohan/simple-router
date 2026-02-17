import { deepStrictEqual } from "node:assert";
import { describe, it } from "node:test";
import { createRouter } from "./router.js";

describe(createRouter.name, () => {
	describe("handle", () => {
		it("should call a route specified in a config", async () => {
			const router = createRouter({
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
			deepStrictEqual(await response.text(), "hello");
		});

		it("should return a 404 response for a non-existing route", async () => {
			const router = createRouter({
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
			deepStrictEqual(response.status, 404);
		});

		it("should call routes in the order specified in the config", async () => {
			/** @type {string[]} */
			let callOrder = [];
			const router = createRouter({
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
			deepStrictEqual(callOrder, ["middleware", "route"]);
		});

		it("should only call the routes for the requested method", async () => {
			const router = createRouter({
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
			deepStrictEqual(await response.text(), "get");
		});

		it("should support params in the path", async () => {
			let params;
			const router = createRouter({
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
			deepStrictEqual(params, { id: "123" });
		});

		it("should support state in context", async () => {
			let hello;
			const router = createRouter({
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
			deepStrictEqual(hello, "world");
		});

		it("should return an HTML response using ctx.html", async () => {
			const router = createRouter({
				routes: [
					{
						path: "/html",
						method: "GET",
						handler: (ctx) => ctx.html("<h1>Hello</h1>", 201),
					},
				],
				initialState: () => ({}),
			});

			const response = await router.handle(
				new Request("http://localhost/html"),
			);

			deepStrictEqual(response.status, 201);
			deepStrictEqual(
				response.headers.get("content-type"),
				"text/html;charset=utf-8",
			);
			deepStrictEqual(await response.text(), "<h1>Hello</h1>");
		});

		it("should return a JSON response using ctx.json", async () => {
			const data = { foo: "bar" };
			const router = createRouter({
				routes: [
					{
						path: "/json",
						method: "GET",
						handler: (ctx) => ctx.json(data),
					},
				],
				initialState: () => ({}),
			});

			const response = await router.handle(
				new Request("http://localhost/json"),
			);

			deepStrictEqual(
				response.headers.get("content-type"),
				"application/json;charset=utf-8",
			);
			deepStrictEqual(await response.json(), data);
		});

		it("should return a plain text response using ctx.text", async () => {
			const router = createRouter({
				routes: [
					{
						path: "/text",
						method: "GET",
						handler: (ctx) => ctx.text("plain text"),
					},
				],
				initialState: () => ({}),
			});

			const response = await router.handle(
				new Request("http://localhost/text"),
			);

			deepStrictEqual(
				response.headers.get("content-type"),
				"text/plain;charset=utf-8",
			);
			deepStrictEqual(await response.text(), "plain text");
		});

		it("should return a redirect response using ctx.redirect", async () => {
			const target = "https://example.com/login";
			const router = createRouter({
				routes: [
					{
						path: "/old-path",
						method: "GET",
						handler: (ctx) => ctx.redirect(target, 301),
					},
				],
				initialState: () => ({}),
			});

			const response = await router.handle(
				new Request("http://localhost/old-path"),
			);

			deepStrictEqual(response.status, 301);
			deepStrictEqual(response.headers.get("location"), target);
		});

		it("should allow setting custom headers using ctx.header", async () => {
			const router = createRouter({
				routes: [
					{
						path: "/custom-header",
						method: "GET",
						handler: (ctx) => {
							ctx.header("X-Custom-Foo", "bar");
							return ctx.text("check headers");
						},
					},
				],
				initialState: () => ({}),
			});

			const response = await router.handle(
				new Request("http://localhost/custom-header"),
			);

			deepStrictEqual(response.headers.get("X-Custom-Foo"), "bar");
			deepStrictEqual(
				response.headers.get("Content-Type"),
				"text/plain;charset=utf-8",
			);
		});

		it("should persist headers set in middleware through to the final response", async () => {
			const router = createRouter({
				routes: [
					{
						path: "*",
						method: "*",
						handler: (ctx) => {
							ctx.header("X-Powered-By", "MyCustomRouter");
							return ctx.next();
						},
					},
					{
						path: "/api/data",
						method: "GET",
						handler: (ctx) => ctx.json({ ok: true }),
					},
				],
				initialState: () => ({}),
			});

			const response = await router.handle(
				new Request("http://localhost/api/data"),
			);

			deepStrictEqual(response.headers.get("X-Powered-By"), "MyCustomRouter");
			deepStrictEqual(
				response.headers.get("Content-Type"),
				"application/json;charset=utf-8",
			);

			const body = await response.json();
			deepStrictEqual(body.ok, true);
		});
	});
});
