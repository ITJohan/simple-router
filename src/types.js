/**
 * @template AppState
 * @typedef {Object} Config
 * @property {Route<AppState>[]} routes - An array of route definitions.
 * @property {function(): AppState} initialState - Function to initialize the application state.
 */

/**
 * @template AppState
 * @typedef {Object} Route
 * @property {string} path - The URL path pattern.
 * @property {"*" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE"} method - The HTTP method.
 * @property {Handler<AppState>} handler - The function that processes the request.
 */

/**
 * @template AppState
 * @callback Handler
 * @param {Context<AppState>} context
 * @returns {Response | Promise<Response>}
 */

/**
 * @template AppState
 * @typedef {Object} Context
 * @property {Request} request - The incoming fetch request object.
 * @property {Record<string, string | undefined>} params - URL parameters.
 * @property {AppState} state - The current application state.
 * @property {function(): (Response | Promise<Response>)} next - Function to call the next handler.
 */

/**
 * @typedef {Object} CookiesState
 * @property {Record<string, string>} cookies - A map of cookie names to values.
 */

export {}