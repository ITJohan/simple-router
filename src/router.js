/**
 * @typedef {{
 *  request: Request;
 *  params: Record<string, string | undefined>;
 *  next: () => Response | Promise<Response>;
 * }} Context
 */

/**
 * @typedef {(
 *  (context: Context) => Response | Promise<Response>
 * )} Handler
 */

/**
 * @typedef {(
 *  "middleware" | "get" | "post" | "put" | "patch" | "delete"
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
        type: "middleware",
        pattern: new URLPattern({ pathname: path ?? "/*" }),
        handler,
      }];
    },
    get: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "get",
        pattern: new URLPattern({ pathname: path }),
        handler,
      }];
    },
    post: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "post",
        pattern: new URLPattern({ pathname: path }),
        handler,
      }];
    },
    put: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "put",
        pattern: new URLPattern({ pathname: path }),
        handler,
      }];
    },
    patch: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "patch",
        pattern: new URLPattern({ pathname: path }),
        handler,
      }];
    },
    delete: ({ path, handler }) => {
      middlewares = [...middlewares, {
        type: "delete",
        pattern: new URLPattern({ pathname: path }),
        handler,
      }];
    },
    handle: (request) => {
      let index = -1;

      /** @type {() => Response | Promise<Response>} */
      const dispatch = () => {
        if (index === middlewares.length - 1) {
          return new Response("Not found", { status: 404 });
        }
        const middleware = middlewares[++index];
        const match = middleware.pattern.exec(request.url);
        if (match) {
          const params = match.pathname.groups;
          return middleware.handler({
            request,
            params,
            next: () => dispatch(),
          });
        }
        return dispatch();
      };

      return dispatch();
    },
  };
};

export { createRouter };
