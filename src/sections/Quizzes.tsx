import { useEffect, useState } from 'react';
import EntityList, { type EntityColumn } from '../components/EntityList';
import { formatDate } from '../util/Dateparser';

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

	const quizColumns: EntityColumn<QuizTypes>[] = [
		{
			header: 'Name',
			render: (quiz) => quiz.quiz_name_en,
			cellClassName: 'entity-name-cell',
		},
		{
			header: 'Id',
			render: (quiz) => quiz.quiz_id,
		},
		{
			header: 'World Id',
			render: (quiz) => quiz.world_id,
		},
		{
			header: 'Created At',
			render: (quiz) => formatDate(quiz.created_at),
		},
	];

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
		/* TODO implement Deletion functionality for quizzes*/
	};
	const onEditClick = (): void => {
		/* TODO implement editing funtionality for quizzes*/
	};

	return (
		<section className='flex flex-col'>
			<EntityList
				title={'Quiz control center'}
				error={error}
				buttonText={'+ Create New Quiz'}
				onCreate={onNewQuizClick}
				data={quizzes}
				columns={quizColumns}
				getKey={(quiz) => quiz.quiz_id}
				gridClassName='quiz-grid'
				onDelete={onDeleteClick}
				onEdit={onEditClick}
			/>
		</section>
	);
};

export default Quizzes;
