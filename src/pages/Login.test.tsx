import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { loadSession } from '../auth/session';
import { adminProfile, makeToken, renderWithAuth } from '../test/auth';
import { findRequest, mockFetch } from '../test/mockFetch';
import Login from './Login';

const token = makeToken();

const renderLogin = (from?: string) =>
	renderWithAuth(
		<Routes>
			<Route path='/login' element={<Login />} />
			<Route path='/quizzes' element={<h1>Quizzes page</h1>} />
			<Route path='/worlds' element={<h1>Worlds page</h1>} />
		</Routes>,
		from ? { pathname: '/login', state: { from } } : '/login',
	);

const successRoutes = {
	'POST /api/auth/login': { body: { message: 'Login email sent' } },
	'POST /api/auth/verify': { body: { message: 'Login successful!', token } },
	'GET /api/user/profile': { body: adminProfile },
};

const fillCredentials = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(screen.getByLabelText('Email'), 'admin@turva.fi');
	await user.type(screen.getByLabelText('Username'), 'admin');
	await user.click(screen.getByRole('button', { name: 'Send code' }));
};

const submitCode = async (
	user: ReturnType<typeof userEvent.setup>,
	code = '123456',
) => {
	await user.type(await screen.findByLabelText('Verification code'), code);
	await user.click(screen.getByRole('button', { name: 'Sign in' }));
};

describe('Login', () => {
	describe('step 1: email and username', () => {
		it('shows validation errors and sends nothing when fields are empty', async () => {
			const user = userEvent.setup();
			const fetchMock = mockFetch(successRoutes);
			renderLogin();

			await user.click(screen.getByRole('button', { name: 'Send code' }));

			expect(
				await screen.findByText('Enter a valid email address'),
			).toBeInTheDocument();
			expect(screen.getByText('Enter your username')).toBeInTheDocument();
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it('requests a code and moves to the code step', async () => {
			const user = userEvent.setup();
			const fetchMock = mockFetch(successRoutes);
			renderLogin();

			await fillCredentials(user);

			expect(
				await screen.findByText('We sent a 6-digit code to admin@turva.fi.'),
			).toBeInTheDocument();
			expect(screen.getByLabelText('Verification code')).toBeInTheDocument();
			expect(findRequest(fetchMock, 'POST', '/api/auth/login')?.body).toEqual({
				email: 'admin@turva.fi',
				username: 'admin',
			});
		});

		it('shows a clear message when no account matches', async () => {
			const user = userEvent.setup();
			mockFetch({
				'POST /api/auth/login': {
					status: 401,
					body: { error: 'Invalid credentials' },
				},
			});
			renderLogin();

			await fillCredentials(user);

			expect(await screen.findByRole('alert')).toHaveTextContent(
				'No account matches this email and username.',
			);
			expect(screen.queryByLabelText('Verification code')).not.toBeInTheDocument();
		});

		it('shows the backend message for other errors', async () => {
			const user = userEvent.setup();
			mockFetch({
				'POST /api/auth/login': {
					status: 400,
					body: { error: 'Email address is not valid' },
				},
			});
			renderLogin();

			await fillCredentials(user);

			expect(await screen.findByRole('alert')).toHaveTextContent(
				'Email address is not valid',
			);
		});

		it('shows a network error when the server is unreachable', async () => {
			const user = userEvent.setup();
			mockFetch({ 'POST /api/auth/login': { networkError: 'Failed to fetch' } });
			renderLogin();

			await fillCredentials(user);

			expect(await screen.findByRole('alert')).toHaveTextContent(
				'Could not reach the server',
			);
		});
	});

	describe('step 2: verification code', () => {
		it('rejects a code that is not 6 digits without calling the API', async () => {
			const user = userEvent.setup();
			const fetchMock = mockFetch(successRoutes);
			renderLogin();
			await fillCredentials(user);

			await submitCode(user, '12ab');

			expect(await screen.findByText('The code has 6 digits')).toBeInTheDocument();
			expect(findRequest(fetchMock, 'POST', '/api/auth/verify')).toBeUndefined();
		});

		it('logs the admin in and opens the quizzes page', async () => {
			const user = userEvent.setup();
			const fetchMock = mockFetch(successRoutes);
			renderLogin();
			await fillCredentials(user);

			await submitCode(user);

			expect(
				await screen.findByRole('heading', { name: 'Quizzes page' }),
			).toBeInTheDocument();
			expect(findRequest(fetchMock, 'POST', '/api/auth/verify')?.body).toEqual({
				email: 'admin@turva.fi',
				username: 'admin',
				verificationCode: '123456',
			});
			expect(
				findRequest(fetchMock, 'GET', '/api/user/profile')?.headers.Authorization,
			).toBe(`Bearer ${token}`);
			expect(loadSession()).toEqual({ token, profile: adminProfile });
		});

		it('goes back to the page the admin first tried to open', async () => {
			const user = userEvent.setup();
			mockFetch(successRoutes);
			renderLogin('/worlds');
			await fillCredentials(user);

			await submitCode(user);

			expect(
				await screen.findByRole('heading', { name: 'Worlds page' }),
			).toBeInTheDocument();
		});

		it('shows an error for an invalid code', async () => {
			const user = userEvent.setup();
			mockFetch({
				...successRoutes,
				'POST /api/auth/verify': {
					status: 401,
					body: { error: 'Code is invalid.' },
				},
			});
			renderLogin();
			await fillCredentials(user);

			await submitCode(user);

			expect(await screen.findByRole('alert')).toHaveTextContent(
				'This code is invalid or has expired.',
			);
			expect(loadSession()).toBeNull();
		});

		it('refuses an account that is not an admin', async () => {
			const user = userEvent.setup();
			mockFetch({
				...successRoutes,
				'GET /api/user/profile': { body: { ...adminProfile, role: 'user' } },
			});
			renderLogin();
			await fillCredentials(user);

			await submitCode(user);

			expect(await screen.findByRole('alert')).toHaveTextContent(
				'This account does not have admin access.',
			);
			expect(loadSession()).toBeNull();
			expect(
				screen.queryByRole('heading', { name: 'Quizzes page' }),
			).not.toBeInTheDocument();
		});

		it('can go back to use another account', async () => {
			const user = userEvent.setup();
			mockFetch(successRoutes);
			renderLogin();
			await fillCredentials(user);

			await user.click(
				await screen.findByRole('button', { name: 'Use another account' }),
			);

			expect(screen.getByRole('button', { name: 'Send code' })).toBeInTheDocument();
		});

		it('can request a new code', async () => {
			const user = userEvent.setup();
			const fetchMock = mockFetch(successRoutes);
			renderLogin();
			await fillCredentials(user);

			await user.click(
				await screen.findByRole('button', { name: 'Send a new code' }),
			);

			const loginCalls = fetchMock.mock.calls.filter(
				([url]) => url.toString() === '/api/auth/login',
			);
			expect(loginCalls).toHaveLength(2);
		});
	});
});
