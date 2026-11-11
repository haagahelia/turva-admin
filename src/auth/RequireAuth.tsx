import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';

/** Shows its children only to a logged-in admin, otherwise redirects to /login. */
const RequireAuth = ({ children }: { children: ReactNode }) => {
	const { token } = useAuth();
	const location = useLocation();

	if (!token) {
		return <Navigate to='/login' replace state={{ from: location.pathname }} />;
	}
	return children;
};

export default RequireAuth;
