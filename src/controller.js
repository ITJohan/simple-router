/**
 * @template T
 * @typedef {Object} Context
 * @property {Request} request
 * @property {Record<string, string>} params
 * @property {T} state
 * @property {() => Response | Promise<Response>} next
 */

/**
 * @template T
 * @typedef {(context: Context<T>) => Response | Promise<Response>} Handler
 */

/**
 * @template T
 * @param {Record<string, Handler<T>>} handlers 
 */
export const createController = (handlers) => {
	/**
	 * @param {Context<T>} context
	 */
	return async (context) => {
		try {
			const method = context.request.method;
			const handler = handlers[method];

			if (typeof handler === "function") {
				return await handler(context);
			}

			return new Response("Method not allowed", { status: 405 });
		} catch (error) {
			console.error("Controller Error:", error);
			return new Response("Internal error", { status: 500 });
		}
	};
};