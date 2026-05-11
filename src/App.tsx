import Quizzes from './sections/Quizzes';
import Sidepanel from './components/Sidepanel';
import { Navigate, Route, Routes } from 'react-router-dom';
import Worlds from './sections/Worlds';
import CrisisTeam from './sections/CrisisTeam';

function App() {
	return (
		<div className='flex min-h-dvh flex-row'>
			<Sidepanel />
			<main className='flex-1 p-4 bg-gray-200'>
				<Routes>
					<Route path='/' element={<Navigate to='/quizzes' replace />} />
					<Route path='/quizzes' element={<Quizzes />} />
					<Route path='/worlds' element={<Worlds />} />
					<Route path='/crisis-team' element={<CrisisTeam />} />
					<Route path='*' element={<Navigate to='/quizzes' replace />} />
				</Routes>
			</main>
		</div>
	);
}

export default App;
