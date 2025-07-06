import type { ExampleMessageType } from "./types";

self.onmessage = (event: MessageEvent<ExampleMessageType>) => {
	const { type, payload } = event.data;

	if (type === "example") {
		const result = `Worker received: ${payload.toUpperCase()}`;
		self.postMessage(result);
	}
};

export {};
