import { useEffect, useState } from 'react';
import { formatDate } from '../util/Dateparser';
import { faTrashCan, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { worldPageWords } from '../constants';

interface WorldTypes {
	world_id: number;
	organization_id: string;
	world_name_en: string;
	order_number: number;
	created_at: string;
	deleted_at: null | string;
}

const Worlds = () => {
	const [worlds, setWorlds] = useState<WorldTypes[]>([]);
	const [error, setError] = useState<string | null>(null);

	const fetchWorlds = () => {
		fetch('/api/world')
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`Request failed with ${response.status}: ${response.statusText}`,
					);
				}

				return response.json();
			})
			.then((data) => setWorlds(data))
			.catch((fetchError: Error) => setError(fetchError.message));
	};

	useEffect(() => {
		fetchWorlds();
	}, []);

	const onNewWorldClick = (): void => {
		/* TODO implement new quiz addition */
	};
	const onDeleteClick = (): void => {
		/* TODO implement Deletion functionality */
	};
	const onEditClick = (): void => {
		/* TODO implement editing funtionality */
	};

	// TODO Worlds & Quizzes use basically the same tsx. In the future abstract it and make it reusable between components

	return (
		<section className='flex flex-col'>
			<div
				role='header'
				className='h-10 w-full bg-transparent text-2xl font-semibold font-sans'
			>
				World control center
			</div>
			{error ?
				<p className='mt-2 text-sm text-red-700'>{error}</p>
			:	null}

			<ul className='bg-white rounded-md py-2 my-3'>
				<button
					className='items-center bg-blue-500 rounded p-1.5 m-2 text-white ml-3 hover:cursor-pointer hover:bg-blue-600'
					onClick={onNewWorldClick}
				>
					+ Create New World
				</button>

				<div role='name-bar' className='quiz-grid-worlds quiz-grid-header'>
					{worldPageWords.map((word) => (
						<span>{word.name}</span>
					))}
				</div>
				{worlds.map((world) => (
					<li key={world.world_id} className='flex flex-col w-full h-16'>
						<div className='quiz-grid-worlds'>
							<span className='quiz-name-cell'>{world.world_name_en}</span>
							<span className='quiz-cell'>{world.world_id}</span>
							<span className='quiz-cell'>{formatDate(world.created_at)}</span>
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

export default Worlds;
