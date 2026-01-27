/** @import { CookiesState } from "../types.js" */

/**
 * @param {Object} props
 * @param {Request} props.request
 * @param {CookiesState} props.state
 * @param {() => Response | Promise<Response>} props.next
 * @returns {Response | Promise<Response>}
 */
const parseCookies = ({ request, state, next }) => {
	const cookieHeader = request.headers.get("Cookie") || "";

	const newCookies = Object.fromEntries(
		cookieHeader
			.split("; ")
			.filter(Boolean)
			.map((cookie) => {
				const [key, value] = cookie.split("=");
				return [decodeURIComponent(key), decodeURIComponent(value)];
			}),
	);

	state.cookies = {
		...state.cookies,
		...newCookies,
	};

	return next();
};

export { parseCookies };
