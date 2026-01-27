/** @import { CookiesState } from "../types.js" */

/**
 * @param {Object} props
 * @param {Request} props.request 
 * @param {CookiesState} props.state 
 * @param {() => Response | Promise<Response>} props.next 
 * @returns {Response | Promise<Response>}
 */
const parseCookies = ({request, state, next}) => {
  state.cookies = {
    ...state.cookies,
    ...request.headers
      .get("Cookie")
      ?.split("; ")
      .map((cookieString) => cookieString.split("="))
      .reduce(
        (cookies, pair) => ({
          ...cookies,
          [decodeURIComponent(pair[0])]: decodeURIComponent(pair[1]),
        }),
        {},
      ),
  };

  return next();
};

export { parseCookies };
