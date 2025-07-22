/**
 * @typedef {(
 *  (context: {
 *    request: Request;
 *    params: Record<string, string | undefined>
 *  }) => Response | Promise<Response>
 * )} Handler
 */

/**
 * @typedef {{
 *  method: "GET" | "POST";
 *  pattern: URLPattern;
 *  handler: Handler;
 * }} Route
 */
