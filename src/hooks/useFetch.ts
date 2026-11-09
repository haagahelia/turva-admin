import { useEffect, useState } from 'react';

interface FetchState<T> {
	data: T[];
	error: string | null;
}

/**
 * Fetches a JSON array from the given URL once on mount.
 * Returns the received data and an error message if the request failed.
 */
export const useFetch = <T>(url: string): FetchState<T> => {
	const [data, setData] = useState<T[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`Request failed with ${response.status}: ${response.statusText}`,
					);
				}

				return response.json();
			})
			.then((json: T[]) => setData(json))
			.catch((fetchError: Error) => setError(fetchError.message));
	}, [url]);

	return { data, error };
};
