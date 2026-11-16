import { vi } from 'vitest';

type RouteResponse =
	| { status?: number; statusText?: string; body: unknown }
	| { networkError: string };

/**
 * Replaces the global fetch with a stub that answers by URL.
 * A key can be a plain URL ('/api/quiz', any method) or 'METHOD URL'
 * ('POST /api/auth/login'), which wins over the plain URL.
 * Unknown URLs answer 404 so a missing mock is easy to spot.
 */
export const mockFetch = (routes: Record<string, RouteResponse>) => {
	const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = input.toString();
		const method = (init?.method ?? 'GET').toUpperCase();
		const route = routes[`${method} ${url}`] ?? routes[url];

		if (!route) {
			return new Response(null, { status: 404, statusText: 'Not Found' });
		}
		if ('networkError' in route) {
			throw new TypeError(route.networkError);
		}

		return new Response(JSON.stringify(route.body), {
			status: route.status ?? 200,
			statusText: route.statusText ?? 'OK',
			headers: { 'Content-Type': 'application/json' },
		});
	});

	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
};

/** Returns the request made to `url` (and `method`), to check headers and body. */
export const findRequest = (
	fetchMock: ReturnType<typeof mockFetch>,
	method: string,
	url: string,
) => {
	const call = fetchMock.mock.calls.find(
		([input, init]) =>
			input.toString() === url && (init?.method ?? 'GET').toUpperCase() === method,
	);
	if (!call) return undefined;
	const init = call[1] ?? {};
	const headers = (init.headers ?? {}) as Record<string, string>;
	const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
	return { headers, body };
};
