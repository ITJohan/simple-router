/** @import { Config } from "./types.js" */

/**
 * @template AppState
 * @param {Config<AppState>} config
 */
export const createRouter = (config) => {
	const routes = Object.freeze(
		config.routes.map(({ path, method, handler }) => ({
			pattern: new URLPattern({ pathname: path }),
			method,
			handler,
		})),
	);

	return {
		/**
		 * @param {Request} request
		 * @returns {Response | Promise<Response>}
		 */
		handle: (request) => {
			const headers = new Headers();
			let index = -1;

			/**
			 * @param {AppState} state
			 * @returns {Response | Promise<Response>}
			 */
			const dispatch = (state) => {
				if (index === config.routes.length - 1) {
					return new Response("Not found", { status: 404 });
				}

				const route = routes[++index];
				const match = route.pattern.exec(request.url);

				if (
					match &&
					(route.method === request.method || route.method === "*")
				) {
					const params = match.pathname.groups;
					return route.handler({
						request,
						params,
						state,
						next: () => dispatch(state),
						html: (body, status = 200) => {
							headers.set("content-type", "text/html;charset=utf-8");
							return new Response(body, { status, headers });
						},
						text: (body, status = 200) => {
							headers.set("content-type", "text/plain;charset=utf-8");
							return new Response(body, { status, headers });
						},
						json: (body, status = 200) => {
							headers.set("content-type", "application/json;charset=utf-8");
							return new Response(JSON.stringify(body), { status, headers });
						},
						redirect: (url, status = 302) => {
							headers.set("location", url);
							return new Response(undefined, { status, headers });
						},
						header: (name, value) => {
							headers.append(name, value);
						},
					});
				}

				return dispatch(state);
			};

			return dispatch(config.initialState());
		},
	};
};
