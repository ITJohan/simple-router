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

    it("should execute middleware for all HTTP methods when using app.use()", () => {
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

      router.handle(getRequest);
      router.handle(postRequest);
      router.handle(putRequest);
      router.handle(patchRequest);
      router.handle(deleteRequest);

      assertEquals(count, 5);
    });

    it("should allow a middleware to add properties to the request object", () => {
      // Confirms that a property added to the request object in one middleware is accessible in subsequent middlewares and in the final route handler.
    });

    it("should allow a middleware to modify the response object (e.g., set headers)", () => {
      // Checks that modifications to the response object, such as setting a custom header, are present in the final response sent to the client.
    });

    it("should pass control to the next middleware when next() is called", () => {
      // Verifies the fundamental behavior of the next function in advancing the middleware chain.
    });

    it("should halt the middleware chain if next() is not called", () => {
      // Ensures that if a middleware neither sends a response nor calls next(), the request processing stops, and subsequent middlewares are not executed. The client request will likely time out, which can be asserted.
    });

    it("should allow a middleware to end the request-response cycle", () => {
      // Tests that if a middleware sends a response, no subsequent middlewares or the final route handler are executed.
    });

    it("should skip to the error-handling middleware when next(error) is called", () => {
      // Verifies that calling next() with an argument immediately transfers control to the next available error-handling middleware (one with an arity of 4: (err, req, res, next)).
    });

    it("should skip non-error-handling middlewares in the chain after an error", () => {
      // Ensures that regular middlewares (arity of 3) are skipped when the router is in an error state.
    });

    it("should execute the first matching error-handling middleware", () => {
      // Confirms that the router correctly identifies and invokes a middleware with 4 arguments as an error handler.
    });

    it("should pass control to the next error-handling middleware if next(error) is called from an error handler", () => {
      // Tests the ability to chain error-handling middlewares, allowing for different types of error processing.
    });

    it("should handle synchronous errors thrown inside a middleware", () => {
      // Verifies that if a middleware function throws an error, it is caught and passed to the error-handling middleware chain.
    });

    it("should handle errors from rejected promises in an async middleware", () => {
      // Checks that if an async middleware rejects, the error is caught and properly propagated to the error-handling chain.
    });

    it("should only execute middleware if the request path matches the middleware path prefix", () => {
      // Tests that a middleware attached with .use('/api', ...) is triggered for /api/users but not for /dashboard.
    });

    it("should correctly handle path parameters in middleware routes", () => {
      // Verifies that a middleware like .use('/users/:id', ...) is invoked for /users/123 and that req.params is correctly populated.
    });

    it("should execute router-level middleware before route-specific middleware", () => {
      // Ensures that if a sub-router is mounted with .use('/admin', adminRouter), the middleware inside adminRouter is executed for all routes defined within it.
    });

    it("should not execute middleware for a different sub-router", () => {
      // Confirms that middleware attached to one sub-router does not run for requests handled by another sub-router.
    });
  });
});
