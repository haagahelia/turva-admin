import Quizzes from './components/Quizzes';
import Sidepanel from './components/Sidepanel';
import { Navigate, Route, Routes } from 'react-router-dom';
import Users from './components/Users';
import Worlds from './components/Worlds';

function App() {
	return (
		<div className='flex min-h-dvh flex-row'>
			<Sidepanel />
			<main className='flex-1 p-6'>
				<Routes>
					<Route path='/' element={<Navigate to='/quizzes' replace />} />
					<Route path='/quizzes' element={<Quizzes />} />
					<Route path='/worlds' element={<Worlds />} />
					<Route path='/users' element={<Users />} />
					<Route path='*' element={<Navigate to='/quizzes' replace />} />
				</Routes>
			</main>
		</div>
	);
}

export default App;
