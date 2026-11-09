import { vi } from 'vitest';

type RouteResponse =
	| { status?: number; statusText?: string; body: unknown }
	| { networkError: string };

/**
 * Replaces the global fetch with a stub that answers by URL.
 * Unknown URLs answer 404 so a missing mock is easy to spot.
 */
export const mockFetch = (routes: Record<string, RouteResponse>) => {
	const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
		const url = input.toString();
		const route = routes[url];

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
