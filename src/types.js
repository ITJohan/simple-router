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
