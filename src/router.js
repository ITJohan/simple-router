/**
 * @typedef {{
 *  request: Request;
 *  params: Record<string, string | undefined>
 * }} Context
 */

/**
 * @typedef {(
 *  (context: Context) => Response | Promise<Response>
 * )} Handler
 */

/**
 * @typedef {{
 *  method: "GET" | "POST";
 *  pattern: URLPattern;
 *  handler: Handler;
 * }} Route
 */

/**
 * @typedef {{
 *  get(pathname: string, handler: Handler): void;
 *  post(pathname: string, handler: Handler): void;
 *  handle(request: Request): Response | Promise<Response>;
 * }} Router
 */

/**
 * @returns {Router}
 */
const createRouter = () => {
  /** @type {Route[]} */
  const routes = [];

  /**
   * @param {string} pathname
   * @param {Handler} handler
   */
  const get = (pathname, handler) => {
    routes.push({
      method: "GET",
      pattern: new URLPattern({ pathname }),
      handler,
    });
  };

  /**
   * @param {string} pathname
   * @param {Handler} handler
   */
  const post = (pathname, handler) => {
    routes.push({
      method: "POST",
      pattern: new URLPattern({ pathname }),
      handler,
    });
  };

  /**
   * @param {Request} request
   */
  const handle = (request) => {
    for (const route of routes) {
      const match = route.pattern.exec(request.url);
      if (match && request.method === route.method) {
        const params = match.pathname.groups;
        return route.handler({ request, params });
      }
    }

    return new Response("Not found", { status: 404 });
  };

  return { get, post, handle };
};

export { createRouter };
