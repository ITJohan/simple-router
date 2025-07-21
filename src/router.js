/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export const handler = async (request) => {
  const url = new URL(request.url);

  let module;
  try {
    module = await import(`.${url.pathname}.js`);
  } catch (_error) {
    return new Response("Not found", { status: 404 });
  }

  if (module[request.method]) {
    return module[request.method](request);
  }

  return new Response("Method not implemented", { status: 501 });
};
