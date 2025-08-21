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
 *  handle(request: Request): Response | Promise<Response>;
 * }} Router
 */

/**
 * @returns {Router}
 */
const createRouter = () => {
  /** @type {Middleware[]} */
  let middlewares = [];

  /**
   * @type {(
   *  ({path, handler}: {path?: string; handler: Handler}) => void
   * )}
   */
  const use = ({ path, handler }) => {
    middlewares = [...middlewares, {
      type: "middleware",
      pattern: new URLPattern({ pathname: path ?? "/*" }),
      handler,
    }];
  };

  /**
   * @type {(
   *  ({path, handler}: {path: string; handler: Handler}) => void
   * )}
   */
  const get = ({ path, handler }) => {
    middlewares = [...middlewares, {
      type: "get",
      pattern: new URLPattern({ pathname: path }),
      handler,
    }];
  };

  /**
   * @type {(
   *  ({path, handler}: {path: string; handler: Handler}) => void
   * )}
   */
  const post = ({ path, handler }) => {
    middlewares = [...middlewares, {
      type: "post",
      pattern: new URLPattern({ pathname: path }),
      handler,
    }];
  };

  /**
   * @param {Request} request
   */
  const handle = (request) => {
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
  };

  return { use, get, post, handle };
};

export { createRouter };
