import { type CookiesState } from "../types.ts";

const parseCookies = ({ request, state, next }: {
  request: Request;
  state: CookiesState;
  next: () => Response | Promise<Response>;
}) => {
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
