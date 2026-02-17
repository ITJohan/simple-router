/**
 * @template AppState
 * @typedef {Object} Config
 * @property {Route<AppState>[]} routes
 * @property {function(): AppState} initialState
 */

/**
 * @template AppState
 * @typedef {Object} Route
 * @property {string} path
 * @property {"*" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE"} method
 * @property {Handler<AppState>} handler
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
 * @property {Request} request
 * @property {Record<string, string | undefined>} params
 * @property {AppState} state
 * @property {function(): (Response | Promise<Response>)} next
 * @property {(body: BodyInit, status?: number) => Response} html
 * @property {(body: string, status?: number) => Response} text
 * @property {(body: object, status?: number) => Response} json
 * @property {(url: string, status?: number) => Response} redirect
 * @property {(name: string, value: string) => void} header
 */

/**
 * @typedef {Object} CookiesState
 * @property {Record<string, string>} cookies
 */

export {};
