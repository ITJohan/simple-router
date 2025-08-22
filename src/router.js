/**
 * @typedef {{
 *  request: Request;
 *  params: Record<string, string | undefined>;
 *  state: AppState;
 *  next: () => Response | Promise<Response>;
 * }} Context
 */

/**
 * @typedef {(
 *  Record<string, any>
 * )} AppState
 */

/**
 * @typedef {(
 *  (context: Context) => Response | Promise<Response>
 * )} Handler
 */

/**
 * @typedef {(
 *  "MIDDLEWARE" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
 * )} MiddlewareType
 */

/**
 * @typedef {{
 *  type: MiddlewareType;
 *  pattern: URLPattern;
 *  handler: Handler;
 * }} Middleware
 */

/**
 * @typedef {{
 *  use: ({path, handler}: {path?: string; handler: Handler}) => void;
 *  get: ({path, handler}: {path: string; handler: Handler}) => void;
 *  post: ({path, handler}: {path: string; handler: Handler}) => void;
 *  put: ({path, handler}: {path: string; handler: Handler}) => void;
 *  patch: ({path, handler}: {path: string; handler: Handler}) => void;
 *  delete: ({path, handler}: {path: string; handler: Handler}) => void;
 *  handle(request: Request): Response | Promise<Response>;
 * }} Router
 */

/**
 * @returns {Router}
 */
const createRouter = () => {
  /** @type {Middleware[]} */
  let middlewares = [];

  return {
    use: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "MIDDLEWARE",
        pattern: new URLPattern({ pathname: path ?? "/*" }),
        handler,
      }];
    },
    get: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "GET",
        pattern: new URLPattern({ pathname: path }),
        handler,
      }];
    },
    post: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "POST",
        pattern: new URLPattern({ pathname: path }),
        handler,
      }];
    },
    put: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "PUT",
        pattern: new URLPattern({ pathname: path }),
        handler,
      }];
    },
    patch: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "PATCH",
        pattern: new URLPattern({ pathname: path }),
        handler,
      }];
    },
    delete: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "DELETE",
        pattern: new URLPattern({ pathname: path }),
        handler,
      }];
    },
    handle: (request) => {
      let index = -1;

      /** @type {({state}: {state: AppState}) => Response | Promise<Response>} */
      const dispatch = ({ state }) => {
        if (index === middlewares.length - 1) {
          return new Response("Not found", { status: 404 });
        }
        const middleware = middlewares[++index];
        const match = middleware.pattern.exec(request.url);
        if (
          match &&
          (middleware.type === request.method ||
            middleware.type === "MIDDLEWARE")
        ) {
          const params = match.pathname.groups;
          return middleware.handler({
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
