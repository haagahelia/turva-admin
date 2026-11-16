/** Error thrown by apiFetch when the backend answers with an error status. */
export class ApiError extends Error {
	readonly status: number;
	readonly body: unknown;

	constructor(status: number, message: string, body: unknown) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.body = body;
	}
}

interface ApiFetchOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	body?: unknown;
	/** Overrides the stored token, e.g. right after login. */
	token?: string | null;
}

let currentToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Called by AuthProvider so every request uses the current session. */
export const configureApiAuth = (
	token: string | null,
	handleUnauthorized: (() => void) | null,
): void => {
	currentToken = token;
	onUnauthorized = handleUnauthorized;
};

const readBody = async (response: Response): Promise<unknown> => {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
};

const errorMessage = (response: Response, body: unknown): string => {
	if (body && typeof body === 'object' && 'error' in body) {
		const error = (body as { error: unknown }).error;
		if (typeof error === 'string') return error;
	}
	return `Request failed with ${response.status}: ${response.statusText}`;
};

/**
 * Calls the backend with JSON and the admin token. Throws an ApiError on an
 * error status. A 401 on an authenticated request ends the session.
 */
export const apiFetch = async <T = unknown>(
	url: string,
	{ method = 'GET', body, token }: ApiFetchOptions = {},
): Promise<T> => {
	const authToken = token === undefined ? currentToken : token;
	const headers: Record<string, string> = { Accept: 'application/json' };
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	if (authToken) headers.Authorization = `Bearer ${authToken}`;

	const response = await fetch(url, {
		method,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const data = await readBody(response);

	if (!response.ok) {
		if (response.status === 401 && authToken && token === undefined) {
			onUnauthorized?.();
		}
		throw new ApiError(response.status, errorMessage(response, data), data);
	}
	return data as T;
};
