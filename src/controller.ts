type Context<T> = {
  request: Request;
  params: Record<string, string>;
  state: T;
  next: () => Response | Promise<Response>;
};

export class Controller<AppState> {
  constructor() {
    this.handle = this.handle.bind(this);
  }

  handle(context: Context<AppState>): Response | Promise<Response> {
    try {
      const handler = (this as Record<string, unknown>)[context.request.method];
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
