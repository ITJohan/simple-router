/**
 * @typedef {{cookies: Record<string, string> | null}} CookiesState
 */

/**
 * @param {{
 *  request: Request;
 *  state: CookiesState;
 *  next: () => Response | Promise<Response>;
 * }} params
 */
const parseCookies = ({ request, state, next }) => {
  state.cookies = request.headers
    .get("Cookie")
    ?.split("; ")
    .map((cookieString) => cookieString.split("="))
    .reduce((cookies, pair) => ({ ...cookies, [pair[0]]: pair[1] }), {}) ??
    null;

  return next();
};

export { parseCookies };
