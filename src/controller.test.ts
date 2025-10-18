import { describe, it } from "@std/testing/bdd";
import { Controller } from "./controller.ts";
import { assertEquals } from "@std/assert";

describe(Controller.name, () => {
  describe("handle", () => {
    class TestController extends Controller<Record<PropertyKey, never>> {
      GET() {
        return new Response("hello");
      }

      POST() {
        throw new Error("crash");
      }
    }
    const testController = new TestController();

    it("should take a request and dispatch it to the appropriate method", async () => {
      const response = await testController.handle({
        request: new Request("http://test/", { method: "GET" }),
        params: {},
        state: {},
        next: () => new Response(),
      });

      assertEquals(await response.text(), "hello");
    });

    it("should return a 405 method now allowed for a method that does not exist", async () => {
      const response = await testController.handle({
        request: new Request("http://test/", { method: "PUT" }),
        params: {},
        state: {},
        next: () => new Response(),
      });

      assertEquals(response.status, 405);
      assertEquals(await response.text(), "Method not allowed");
    });

    it("should return 500 internal error if exceptional error is thrown", async () => {
      const response = await testController.handle({
        request: new Request("http://test/", { method: "POST" }),
        params: {},
        state: {},
        next: () => new Response(),
      });

      assertEquals(response.status, 500);
      assertEquals(await response.text(), "Internal error");
    });
  });
});
