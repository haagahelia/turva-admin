import { useEffect, useState } from 'react';
import { formatDate } from '../util/Dateparser';
import { faTrashCan, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface QuizTypes {
	quiz_id: number;
	quiz_name_fi: string;
	quiz_name_en: string;
	quiz_content: [];
	world_id: number;
	order_number: number;
	created_at: string;
	deleted_at: null | string;
}

const Quizzes = () => {
	const [quizzes, setQuizzes] = useState<QuizTypes[]>([]);
	const [error, setError] = useState<string | null>(null);

	const fetchQuizzes = () => {
		fetch('/api/quiz')
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`Request failed with ${response.status}: ${response.statusText}`,
					);
				}

				return response.json();
			})
			.then((data) => setQuizzes(data))
			.catch((fetchError: Error) => setError(fetchError.message));
	};

	useEffect(() => {
		fetchQuizzes();
	}, []);

	const onNewQuizClick = (): void => {
		/* TODO implement new quiz addition */
	};
	const onDeleteClick = (): void => {
		/* TODO implement Deletion functionality */
	};
	const onEditClick = (): void => {
		/* TODO implement editing funtionality */
	};

	return (
		<section className='flex flex-col'>
			<div
				role='header'
				className='h-10 w-full bg-transparent text-2xl font-semibold font-sans'
			>
				Quiz controll center
			</div>
			{error ?
				<p className='mt-2 text-sm text-red-700'>{error}</p>
			:	null}

			<ul className='bg-white rounded-md py-2 my-3'>
				<button
					className='items-center bg-blue-500 rounded p-1.5 m-2 text-white ml-3 hover:cursor-pointer'
					onClick={onNewQuizClick}
				>
					+ Create New Quiz
				</button>

				<div
					role='name-bar'
					className='grid grid-cols-[minmax(0,4fr)_80px_100px_200px_80px] items-center gap-4 p-2 my-3 bg-gray-600 text-white text-md font-normal'
				>
					<span>Name</span>
					<span>Id</span>
					<span>World Id</span>
					<span>Created At</span>
					<span>Actions</span>
				</div>
				{quizzes.map((quiz) => (
					<li key={quiz.quiz_id} className='flex flex-col w-full h-16'>
						<div className='grid grid-cols-[minmax(0,4fr)_80px_100px_200px_80px] items-center gap-4 p-2'>
							<span className='font-medium text-md truncate'>
								{quiz.quiz_name_en}
							</span>
							<span className='font-medium text-md'>{quiz.quiz_id}</span>
							<span className='font-medium text-md'>{quiz.world_id}</span>
							<span className='font-medium text-md'>
								{formatDate(quiz.created_at)}
							</span>
							<div className='flex gap-3'>
								<button
									type='button'
									aria-label='Delete'
									className='group relative hover:cursor-pointer'
									onClick={onDeleteClick}
								>
									<FontAwesomeIcon
										icon={faTrashCan}
										style={{ color: 'rgb(250,24,44)', scale: 1.25 }}
									/>
									<span className='pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
										Delete
									</span>
								</button>
								<button
									type='button'
									aria-label='Edit'
									className='group relative hover:cursor-pointer'
									onClick={onEditClick}
								>
									<FontAwesomeIcon
										icon={faPenToSquare}
										style={{ color: 'rgb(116,192,252)', scale: 1.25 }}
									/>
									<span className='pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100'>
										Edit
									</span>
								</button>
							</div>
						</div>
						<div className='mt-2 h-px w-full bg-slate-400' />
					</li>
				))}
			</ul>
		</section>
	);
};

export default Quizzes;
