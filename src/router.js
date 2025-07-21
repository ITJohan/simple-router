/// <reference types="./router.d.ts" />

export default class Router {
  /** @type {Route[]} */
  routes;

  constructor() {
    this.routes = [];
  }

  /**
   * @param {string} pathname
   * @param {Handler} handler
   */
  get(pathname, handler) {
    this.routes.push({
      method: "GET",
      pattern: new URLPattern({ pathname }),
      handler,
    });
  }

  /**
   * @param {string} pathname
   * @param {Handler} handler
   */
  post(pathname, handler) {
    this.routes.push({
      method: "POST",
      pattern: new URLPattern({ pathname }),
      handler,
    });
  }

  /**
   * @param {Request} request
   */
  handle(request) {
    for (const route of this.routes) {
      const match = route.pattern.exec(request.url);
      if (match && request.method === route.method) {
        const params = match.pathname.groups;
        return route.handler({ request: request, params });
      }
    }

    return new Response("No found", { status: 404 });
  }
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export const handler = async (request) => {
  const url = new URL(request.url);

  let module;
  try {
    module = await import(`.${url.pathname}.js`);
  } catch (_error) {
    return new Response("Not found", { status: 404 });
  }

  if (module[request.method]) {
    return module[request.method](request);
  }

  return new Response("Method not implemented", { status: 501 });
};
