import { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";

/**
 * @param {IncomingMessage} nodeRequest
 */
const toWebHeaders = (nodeRequest) => {
	const webHeaders = new Headers();

	for (const [key, value] of Object.entries(nodeRequest.headers)) {
		if (value === undefined) continue;

		if (Array.isArray(value)) {
			for (const v of value) {
				webHeaders.append(key, v);
			}
		} else {
			webHeaders.set(key, value);
		}
	}

	return webHeaders;
};

/**
 * @param {IncomingMessage} nodeRequest
 */
const toWebBody = (nodeRequest) => {
	if (["GET", "HEAD"].includes(nodeRequest.method ?? "")) return null;

	return /** @type {ReadableStream} */ (Readable.toWeb(nodeRequest));
};

/**
 * @param {(request: Request) => Promise<Response> | Response} webHandler
 * @returns {Promise<(nodeRequest: IncomingMessage, nodeResponse: ServerResponse) => void>}
 */
export const createWebHandler = async (webHandler) => {
	return async (nodeRequest, nodeResponse) => {
		try {
			const protocol = nodeRequest.headers["x-forwarded-proto"] || "http";
			const host = nodeRequest.headers.host;
			const url = new URL(nodeRequest.url ?? "/", `${protocol}://${host}`);

			const webRequest = new Request(url, {
				method: nodeRequest.method,
				headers: toWebHeaders(nodeRequest),
				body: toWebBody(nodeRequest),
				// @ts-expect-error: mandatory in Chromium
				duplex: "half",
			});

			const webResponse = await webHandler(webRequest);

			nodeResponse.statusCode = webResponse.status;
			webResponse.headers.forEach((value, key) => {
				nodeResponse.setHeader(key, value);
			});

			if (webResponse.body) {
				Readable.fromWeb(/** @type {any} */(webResponse.body)).pipe(
					nodeResponse,
				);
			} else {
				nodeResponse.end();
			}
		} catch (err) {
			console.error(err);
			nodeResponse.statusCode = 500;
			nodeResponse.end("Internal Server Error");
		}
	};
}
