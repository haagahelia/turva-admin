import { createContext, useContext } from 'react';
import type { AdminProfile, Session } from './session';

export interface AuthContextValue {
	token: string | null;
	profile: AdminProfile | null;
	/** True when the session ended because the token was rejected or expired. */
	sessionExpired: boolean;
	login: (session: Session) => void;
	logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used inside <AuthProvider>');
	}
	return context;
};
