import { describe, expect, it } from 'vitest';
import { adminProfile, makeToken } from '../test/auth';
import { clearSession, isTokenExpired, loadSession, saveSession } from './session';

describe('isTokenExpired', () => {
	it('is false for a token that expires in the future', () => {
		expect(isTokenExpired(makeToken(3600))).toBe(false);
	});

	it('is true for a token that already expired', () => {
		expect(isTokenExpired(makeToken(-1))).toBe(true);
	});

	it('is true for a value that is not a JWT', () => {
		expect(isTokenExpired('not-a-token')).toBe(true);
	});
});

describe('session storage', () => {
	it('saves and loads a valid session', () => {
		const session = { token: makeToken(), profile: adminProfile };
		saveSession(session);

		expect(loadSession()).toEqual(session);
	});

	it('drops an expired session', () => {
		saveSession({ token: makeToken(-60), profile: adminProfile });

		expect(loadSession()).toBeNull();
		expect(localStorage.length).toBe(0);
	});

	it('ignores corrupted data', () => {
		localStorage.setItem('turva-admin-session', '{not json');

		expect(loadSession()).toBeNull();
	});

	it('clears the session', () => {
		saveSession({ token: makeToken(), profile: adminProfile });
		clearSession();

		expect(loadSession()).toBeNull();
	});
});
