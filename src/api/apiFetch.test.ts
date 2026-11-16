import { afterEach, describe, expect, it, vi } from 'vitest';
import { findRequest, mockFetch } from '../test/mockFetch';
import { ApiError, apiFetch, configureApiAuth } from './apiFetch';

describe('apiFetch', () => {
	afterEach(() => {
		configureApiAuth(null, null);
	});

	it('returns the parsed JSON body', async () => {
		mockFetch({ '/api/world': { body: [{ world_id: 1 }] } });

		await expect(apiFetch('/api/world')).resolves.toEqual([{ world_id: 1 }]);
	});

	it('sends the stored token and a JSON body', async () => {
		const fetchMock = mockFetch({ 'POST /api/world': { body: { world_id: 2 } } });
		configureApiAuth('stored-token', null);

		await apiFetch('/api/world', { method: 'POST', body: { name: 'New' } });

		const request = findRequest(fetchMock, 'POST', '/api/world');
		expect(request?.headers.Authorization).toBe('Bearer stored-token');
		expect(request?.headers['Content-Type']).toBe('application/json');
		expect(request?.body).toEqual({ name: 'New' });
	});

	it('sends no Authorization header when token is null', async () => {
		const fetchMock = mockFetch({ 'POST /api/auth/login': { body: {} } });
		configureApiAuth('stored-token', null);

		await apiFetch('/api/auth/login', { method: 'POST', body: {}, token: null });

		expect(
			findRequest(fetchMock, 'POST', '/api/auth/login')?.headers.Authorization,
		).toBeUndefined();
	});

	it('throws an ApiError with the backend error message', async () => {
		mockFetch({
			'DELETE /api/world/3': {
				status: 409,
				statusText: 'Conflict',
				body: { error: 'World still has 2 active quiz(zes).', quiz_count: 2 },
			},
		});

		const error = await apiFetch('/api/world/3', { method: 'DELETE' }).catch(
			(err: unknown) => err,
		);

		expect(error).toBeInstanceOf(ApiError);
		expect(error).toMatchObject({
			status: 409,
			message: 'World still has 2 active quiz(zes).',
			body: { quiz_count: 2 },
		});
	});

	it('falls back to the status text when the body has no error message', async () => {
		mockFetch({ '/api/world': { status: 500, statusText: 'Server Error', body: {} } });

		await expect(apiFetch('/api/world')).rejects.toThrow(
			'Request failed with 500: Server Error',
		);
	});

	it('ends the session on a 401 for a request using the stored token', async () => {
		const onUnauthorized = vi.fn();
		mockFetch({ 'PUT /api/world/1': { status: 401, body: { error: 'Token has expired' } } });
		configureApiAuth('stored-token', onUnauthorized);

		await expect(apiFetch('/api/world/1', { method: 'PUT', body: {} })).rejects.toThrow();

		expect(onUnauthorized).toHaveBeenCalledOnce();
	});

	it('does not end the session on a 401 during login', async () => {
		const onUnauthorized = vi.fn();
		mockFetch({ 'POST /api/auth/verify': { status: 401, body: {} } });
		configureApiAuth('stored-token', onUnauthorized);

		await expect(
			apiFetch('/api/auth/verify', { method: 'POST', body: {}, token: null }),
		).rejects.toThrow();

		expect(onUnauthorized).not.toHaveBeenCalled();
	});
});
