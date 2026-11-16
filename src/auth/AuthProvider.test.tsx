import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { apiFetch } from '../api/apiFetch';
import { logInAsAdmin, renderWithAuth } from '../test/auth';
import { findRequest, mockFetch } from '../test/mockFetch';
import { useAuth } from './authContext';
import { loadSession } from './session';

const SaveButton = () => {
	const { token } = useAuth();
	return (
		<button
			type='button'
			onClick={() =>
				apiFetch('/api/world/1', { method: 'PUT', body: {} }).catch(() => {})
			}
		>
			{token ? 'Save' : 'Logged out'}
		</button>
	);
};

describe('AuthProvider', () => {
	it('sends the logged-in token with apiFetch requests', async () => {
		const user = userEvent.setup();
		const token = logInAsAdmin();
		const fetchMock = mockFetch({ 'PUT /api/world/1': { body: {} } });
		renderWithAuth(<SaveButton />);

		await user.click(screen.getByRole('button', { name: 'Save' }));

		expect(findRequest(fetchMock, 'PUT', '/api/world/1')?.headers.Authorization).toBe(
			`Bearer ${token}`,
		);
	});

	it('ends the session when the backend rejects the token', async () => {
		const user = userEvent.setup();
		logInAsAdmin();
		mockFetch({
			'PUT /api/world/1': { status: 401, body: { error: 'Token has expired' } },
		});
		renderWithAuth(<SaveButton />);

		await user.click(screen.getByRole('button', { name: 'Save' }));

		expect(
			await screen.findByRole('button', { name: 'Logged out' }),
		).toBeInTheDocument();
		expect(loadSession()).toBeNull();
	});

	it('tells the admin on the login page that the session expired', async () => {
		const user = userEvent.setup();
		logInAsAdmin();
		mockFetch({
			'/api/quiz': { body: [] },
			'PUT /api/world/1': { status: 401, body: { error: 'Token has expired' } },
		});
		renderWithAuth(
			<>
				<SaveButton />
				<App />
			</>,
			'/quizzes',
		);

		await user.click(screen.getByRole('button', { name: 'Save' }));

		expect(await screen.findByRole('status')).toHaveTextContent(
			'Your session has expired. Please sign in again.',
		);
	});
});
