/** @import { Config } from "./types.js" */

/** @template AppState */
export class Router {
  #config;
  #routes;

  /** @param {Config<AppState>} config */
  constructor(config) {
    this.#config = config;
    this.#routes = Object.freeze(
      config.routes.map(({ path, method, handler }) => ({
        pattern: new URLPattern({ pathname: path }),
        method,
        handler,
      })),
    );
  }

  /**
   * @param {Request} request
   * @returns {Response | Promise<Response>}
   */
  handle(request) {
    let index = -1;

    /**
     * @param {AppState} state
     * @returns {Response | Promise<Response>}
     */
    const dispatch = (state) => {
      if (index === this.#config.routes.length - 1) {
        return new Response("Not found", { status: 404 });
      }
      const route = this.#routes[++index];
      const match = route.pattern.exec(request.url);
      if (
        match &&
        (route.method === request.method ||
          route.method === "*")
      ) {
        const params = match.pathname.groups;
        return route.handler({
          request,
          params,
          state,
          next: () => dispatch(state),
        });
      }
      return dispatch(state);
    };

    return dispatch(this.#config.initialState());
  }
}
