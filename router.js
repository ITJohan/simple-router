/**
 * @typedef {(request: Request) => Promise<Response>} Route
 */

/**
 * @typedef {{
 *  pattern: URLPattern;
 *  route: Route;
 * }} RouteConfig
 */

/**
 * @typedef {RouteConfig[]} RouterConfig
 */

/**
 * @param {RouterConfig} config
 * @returns {Route}
 */
const createRouter = (config) => async (request) =>
  await config.find((routeConfig) => routeConfig.pattern.test(request.url))
    ?.route(
      request,
    ) ?? new Response("Not found", { status: 404 });

export { createRouter };
