/**
 * @typedef {(
 *  (config: Config) => { handle: ((request: Request) => Response) | ((request: Request) => Promise<Response>) }
 * )} Router
 */

/**
 * @typedef {ConfigRoute[]} Config
 */

/**
 * @typedef {{
 *  path: string;
 *  method: "*" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
 *  handler: Handler;
 * }} ConfigRoute
 */

/**
 * @typedef {(
 *  ((context: Context) => Response) | ((context: Context) => Promise<Response>)
 * )} Handler
 */

/**
 * @typedef {{
 *  request: Request;
 *  params: Record<string, string | undefined>;
 *  state: AppState;
 *  next: (() => Response) | (() => Promise<Response>);
 * }} Context
 */

/**
 * @typedef {(
 *  Record<string, any>
 * )} AppState
 */
