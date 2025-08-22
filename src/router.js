/** @import { Router, AppState } from "./types.js" */

/** @type {Router} */
const createRouter = (config) => {
  const routes = Object.freeze(config.map(({ path, method, handler }) => ({
    pattern: new URLPattern({ pathname: path }),
    method,
    handler,
  })));

  return {
    handle: (request) => {
      let index = -1;

      /** @type {({state}: {state: AppState}) => Response | Promise<Response>} */
      const dispatch = ({ state }) => {
        if (index === config.length - 1) {
          return new Response("Not found", { status: 404 });
        }
        const route = routes[++index];
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
            next: () => dispatch({ state }),
          });
        }
        return dispatch({ state });
      };

      return dispatch({ state: {} });
    },
  };
};

export { createRouter };
