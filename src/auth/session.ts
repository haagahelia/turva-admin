export interface AdminProfile {
	userId: number;
	profileName: string;
	email: string;
	role: string;
}

export interface Session {
	token: string;
	profile: AdminProfile;
}

const STORAGE_KEY = 'turva-admin-session';

/** Reads the `exp` claim (seconds) of a JWT. Returns null if it can't be read. */
const getTokenExpiry = (token: string): number | null => {
	try {
		const payload = token.split('.')[1];
		const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
		const exp = (JSON.parse(json) as { exp?: unknown }).exp;
		return typeof exp === 'number' ? exp : null;
	} catch {
		return null;
	}
};

export const isTokenExpired = (token: string, now = Date.now()): boolean => {
	const exp = getTokenExpiry(token);
	return exp === null || exp * 1000 <= now;
};

/** Returns the stored session, or null if there is none or the token expired. */
export const loadSession = (): Session | null => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const session = JSON.parse(raw) as Session;
		if (!session?.token || !session.profile || isTokenExpired(session.token)) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return session;
	} catch {
		return null;
	}
};

export const saveSession = (session: Session): void => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
	} catch {
		// Storage can be unavailable (private mode); the session then lasts
		// until the page is reloaded.
	}
};

export const clearSession = (): void => {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Nothing to clear
	}
};
