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
 *  (context: Context<AppState>) => Response | Promise<Response>
 * )} Handler
 */

/**
 * @template AppState
 * @typedef {{
 *  request: Request;
 *  params: Record<string, string | undefined>;
 *  state: AppState;
 *  next: () => Response | Promise<Response>;
 * }} Context
 */
