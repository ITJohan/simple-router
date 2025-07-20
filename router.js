if ("URLPattern" in globalThis) {
  // TODO: Load URLPattern polyfill
}

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
    // TOOD: implement middleware support
    for (const route of this.routes) {
      const match = route.pattern.exec(request.url);
      if (match && request.method === route.method) {
        const params = match.pathname.groups;
        return route.handler({ request: request, params });
      }
    }
  }
}
