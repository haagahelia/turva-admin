import { useEffect, useState } from 'react';
import { formatDate } from '../util/Dateparser';
import { faTrashCan, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { quizPageWords } from '../constants';

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
				Quiz control center
			</div>
			{error ?
				<p className='mt-2 text-sm text-red-700'>{error}</p>
			:	null}

			<ul className='bg-white rounded-md py-2 my-3'>
				<button
					className='items-center bg-blue-500 rounded p-1.5 m-2 text-white ml-3 hover:cursor-pointer hover:bg-blue-600'
					onClick={onNewQuizClick}
				>
					+ Create New Quiz
				</button>

				<div role='name-bar' className='quiz-grid quiz-grid-header'>
					{quizPageWords.map((word) => (
						<span>{word.name}</span>
					))}
				</div>
				{quizzes.map((quiz) => (
					<li key={quiz.quiz_id} className='flex flex-col w-full h-16'>
						<div className='quiz-grid'>
							<span className='quiz-name-cell'>{quiz.quiz_name_en}</span>
							<span className='quiz-cell'>{quiz.quiz_id}</span>
							<span className='quiz-cell'>{quiz.world_id}</span>
							<span className='quiz-cell'>{formatDate(quiz.created_at)}</span>
							<div className='quiz-actions'>
								<button
									type='button'
									aria-label='Delete'
									className='quiz-action-btn'
									onClick={onDeleteClick}
								>
									<FontAwesomeIcon
										icon={faTrashCan}
										style={{ color: 'rgb(250,24,44)', scale: 1.25 }}
									/>
									<span className='quiz-action-tooltip'>Delete</span>
								</button>
								<button
									type='button'
									aria-label='Edit'
									className='quiz-action-btn'
									onClick={onEditClick}
								>
									<FontAwesomeIcon
										icon={faPenToSquare}
										style={{ color: 'rgb(116,192,252)', scale: 1.25 }}
									/>
									<span className='quiz-action-tooltip'>Edit</span>
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
