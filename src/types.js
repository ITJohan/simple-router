/**
 * @typedef {{
 *  request: Request;
 *  params: Record<string, string | undefined>
 * }} Context
 */

/**
 * @typedef {(
 *  (context: Context) => Response
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
