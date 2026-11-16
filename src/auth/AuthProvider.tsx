import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { configureApiAuth } from '../api/apiFetch';
import { AuthContext, type AuthContextValue } from './authContext';
import {
	clearSession,
	isTokenExpired,
	loadSession,
	saveSession,
	type Session,
} from './session';

const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [session, setSession] = useState<Session | null>(loadSession);
	const [sessionExpired, setSessionExpired] = useState(false);

	const login = useCallback((newSession: Session) => {
		saveSession(newSession);
		setSessionExpired(false);
		setSession(newSession);
	}, []);

	const logout = useCallback(() => {
		clearSession();
		setSessionExpired(false);
		setSession(null);
	}, []);

	const expire = useCallback(() => {
		clearSession();
		setSessionExpired(true);
		setSession(null);
	}, []);

	// Give apiFetch the current token, and end the session on a 401.
	useEffect(() => {
		configureApiAuth(session?.token ?? null, expire);
		return () => configureApiAuth(null, null);
	}, [session, expire]);

	// Log out when the token expires while the app is open.
	useEffect(() => {
		if (!session) return;
		const check = () => {
			if (isTokenExpired(session.token)) expire();
		};
		const interval = window.setInterval(check, 60_000);
		return () => window.clearInterval(interval);
	}, [session, expire]);

	const value = useMemo<AuthContextValue>(
		() => ({
			token: session?.token ?? null,
			profile: session?.profile ?? null,
			sessionExpired,
			login,
			logout,
		}),
		[session, sessionExpired, login, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
