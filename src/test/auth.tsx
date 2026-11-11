import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import AuthProvider from '../auth/AuthProvider';
import { saveSession, type AdminProfile } from '../auth/session';

const base64Url = (value: object) =>
	btoa(JSON.stringify(value))
		.replace(/=+$/, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');

/** Builds a fake JWT. Only the payload matters to the frontend. */
export const makeToken = (expiresInSeconds = 3600): string =>
	[
		base64Url({ alg: 'HS256', typ: 'JWT' }),
		base64Url({
			email: 'admin@turva.fi',
			username: 'admin',
			exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
		}),
		'signature',
	].join('.');

export const adminProfile: AdminProfile = {
	userId: 1,
	profileName: 'Admin User',
	email: 'admin@turva.fi',
	role: 'admin',
};

/** Stores a valid admin session, as if the admin had logged in before. */
export const logInAsAdmin = (token = makeToken()) => {
	saveSession({ token, profile: adminProfile });
	return token;
};

/** Renders inside a router and the real AuthProvider. */
export const renderWithAuth = (
	ui: ReactNode,
	path: string | { pathname: string; state?: unknown } = '/',
) =>
	render(
		<MemoryRouter initialEntries={[path]}>
			<AuthProvider>{ui}</AuthProvider>
		</MemoryRouter>,
	);
