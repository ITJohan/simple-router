import { type Config } from "./types.ts";

export class Router<AppState> {
  #config;
  #routes;

  constructor(config: Config<AppState>) {
    this.#config = config;
    this.#routes = Object.freeze(
      config.routes.map(({ path, method, handler }) => ({
        pattern: new URLPattern({ pathname: path }),
        method,
        handler,
      })),
    );
  }

  handle(request: Request) {
    let index = -1;

    const dispatch = (state: AppState): Response | Promise<Response> => {
      if (index === this.#config.routes.length - 1) {
        return new Response("Not found", { status: 404 });
      }
      const route = this.#routes[++index];
      const match = route.pattern.exec(request.url);
      if (
        match &&
        (route.method === request.method ||
          route.method === "*")
      ) {
        const params = match.pathname.groups;
        return route.handler({
          request,
          params,
          state,
          next: () => dispatch(state),
        });
      }
      return dispatch(state);
    };

    return dispatch(this.#config.initialState());
  }
}
