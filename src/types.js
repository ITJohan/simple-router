/**
 * @template AppState
 * @typedef {{
 *  routes: Route<AppState>[];
 *  initialState: () => AppState;
 * }} Config
 */

/**
 * @template AppState
 * @typedef {{
 *  path: string;
 *  method: "*" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
 *  handler: Handler<AppState>;
 * }} Route
 */

/**
 * @template AppState
 * @typedef {(
 *  ((context: Context<AppState>) => Response) |
 *  ((context: Context<AppState>) => Promise<Response>) |
 *  ((context: Context<AppState>) => Response | Promise<Response>)
 * )} Handler
 */

/**
 * @template AppState
 * @typedef {object} Context
 * @property {Request} request
 * @property {Record<string, string | undefined>} params
 * @property {AppState} state
 * @property {() => Response | Promise<Response>} next
 */

/**
 * @typedef {{cookies: Record<string, string>}} CookiesState
 */
