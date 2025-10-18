export type Config<AppState> = {
  routes: Route<AppState>[];
  initialState: () => AppState;
};

export type Route<AppState> = {
  path: string;
  method: "*" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  handler: Handler<AppState>;
};

export type Handler<AppState> =
  | ((context: Context<AppState>) => Response)
  | ((context: Context<AppState>) => Promise<Response>)
  | ((context: Context<AppState>) => Response | Promise<Response>);

export type Context<AppState> = {
  request: Request;
  params: Record<string, string | undefined>;
  state: AppState;
  next: () => Response | Promise<Response>;
};

export type CookiesState = {
  cookies: Record<string, string>;
};
