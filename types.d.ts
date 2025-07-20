type Handler = (params: {
  request: Request;
  params: Record<string, string | undefined>;
  event: FetchEvent;
}) => Response | Promise<Response>;

type Route = {
  method: "GET" | "POST";
  pattern: URLPattern;
  handler: Handler;
};
