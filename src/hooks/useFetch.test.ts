import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockFetch } from '../test/mockFetch';
import { useFetch } from './useFetch';

describe('useFetch', () => {
	it('starts with empty data and no error', () => {
		mockFetch({ '/api/items': { body: [] } });

		const { result } = renderHook(() => useFetch('/api/items'));

		expect(result.current.data).toEqual([]);
		expect(result.current.error).toBeNull();
	});

	it('returns the data received from the API', async () => {
		const items = [
			{ id: 1, name: 'First' },
			{ id: 2, name: 'Second' },
		];
		const fetchMock = mockFetch({ '/api/items': { body: items } });

		const { result } = renderHook(() => useFetch('/api/items'));

		await waitFor(() => expect(result.current.data).toEqual(items));
		expect(result.current.error).toBeNull();
		expect(fetchMock).toHaveBeenCalledWith('/api/items');
	});

	it('returns an error message when the API answers with an error status', async () => {
		mockFetch({
			'/api/items': {
				status: 500,
				statusText: 'Internal Server Error',
				body: {},
			},
		});

		const { result } = renderHook(() => useFetch('/api/items'));

		await waitFor(() =>
			expect(result.current.error).toBe(
				'Request failed with 500: Internal Server Error',
			),
		);
		expect(result.current.data).toEqual([]);
	});

	it('returns an error message when the network request fails', async () => {
		mockFetch({ '/api/items': { networkError: 'Failed to fetch' } });

		const { result } = renderHook(() => useFetch('/api/items'));

		await waitFor(() => expect(result.current.error).toBe('Failed to fetch'));
		expect(result.current.data).toEqual([]);
	});
});
