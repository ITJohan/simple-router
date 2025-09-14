/**
 * @template T
 * @typedef {object} Context
 * @property {Request} request
 * @property {Record<string, string>} params
 * @property {T} state
 * @property {() => Response | Promise<Response>} next
 */

/** @template AppState */
export class Controller {
  constructor() {
    this.handle = this.handle.bind(this);
  }

  /**
   * @param {Context<AppState>} context
   * @returns {Response | Promise<Response>}
   */
  handle(context) {
    try {
      const handler = (/** @type {any} */ (this))[context.request.method];
      if (typeof handler === "function") {
        return handler.call(this, context);
      } else {
        return new Response("Method not allowed", { status: 405 });
      }
    } catch (error) {
      console.error(error);
      return new Response("Internal error", { status: 500 });
    }
  }
}
