import Quizzes from './sections/Quizzes';
import Sidepanel from './components/Sidepanel';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Worlds from './sections/Worlds';
import CrisisTeam from './sections/CrisisTeam';
import Login from './pages/Login';
import RequireAuth from './auth/RequireAuth';

const DashboardLayout = () => (
	<div className='flex min-h-dvh flex-row'>
		<Sidepanel />
		<main className='flex-1 p-4 bg-gray-200'>
			<Outlet />
		</main>
	</div>
);

function App() {
	return (
		<Routes>
			<Route path='/login' element={<Login />} />
			<Route
				element={
					<RequireAuth>
						<DashboardLayout />
					</RequireAuth>
				}
			>
				<Route path='/' element={<Navigate to='/quizzes' replace />} />
				<Route path='/quizzes' element={<Quizzes />} />
				<Route path='/worlds' element={<Worlds />} />
				<Route path='/crisis-team' element={<CrisisTeam />} />
				<Route path='*' element={<Navigate to='/quizzes' replace />} />
			</Route>
		</Routes>
	);
}

export default App;
