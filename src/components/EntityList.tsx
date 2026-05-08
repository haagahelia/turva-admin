import type { ReactNode } from 'react';
import { faTrashCan, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface EntityColumn<T> {
	header: string;
	render: (item: T) => ReactNode;
	cellClassName?: string;
}

interface EntityListProps<T = unknown> {
	title: string;
	error: string | null;
	buttonText: string;
	onCreate: () => void;
	data: T[];
	columns: EntityColumn<T>[];
	getKey: (item: T) => string | number;
	gridClassName: string;
	actionsHeader?: string;
	onDelete: (item: T) => void;
	onEdit: (item: T) => void;
}

const EntityList = <T,>(props: EntityListProps<T>) => {
	return (
		<>
			<div
				role='header'
				className='h-10 w-full bg-transparent text-2xl font-semibold font-sans'
			>
				{props.title}
			</div>
			{props.error ?
				<p className='mt-2 text-sm text-red-700'>{props.error}</p>
			:	null}

			<ul className='bg-white rounded-md py-2 my-3'>
				<button
					className='items-center bg-blue-500 rounded p-1.5 m-2 text-white ml-3 hover:cursor-pointer hover:bg-blue-600'
					onClick={props.onCreate}
				>
					{props.buttonText}
				</button>

				<div
					role='name-bar'
					className={`${props.gridClassName} entity-grid-header`}
				>
					{props.columns.map((column) => (
						<span key={column.header}>{column.header}</span>
					))}
					<span>Actions</span>
				</div>
				{props.data.map((item) => (
					<li key={props.getKey(item)} className='flex flex-col w-full h-16'>
						<div className={props.gridClassName}>
							{props.columns.map((column) => (
								<span
									key={column.header}
									className={column.cellClassName ?? 'entity-cell'}
								>
									{column.render(item)}
								</span>
							))}
							<div className='entity-actions'>
								<button
									type='button'
									aria-label='Delete'
									className='entity-action-btn'
									onClick={() => props.onDelete(item)}
								>
									<FontAwesomeIcon
										icon={faTrashCan}
										style={{ color: 'rgb(250,24,44)', scale: 1.25 }}
									/>
									<span className='entity-action-tooltip'>Delete</span>
								</button>
								<button
									type='button'
									aria-label='Edit'
									className='entity-action-btn'
									onClick={() => props.onEdit(item)}
								>
									<FontAwesomeIcon
										icon={faPenToSquare}
										style={{ color: 'rgb(116,192,252)', scale: 1.25 }}
									/>
									<span className='entity-action-tooltip'>Edit</span>
								</button>
							</div>
						</div>
						<div className='mt-2 h-px w-full bg-slate-400' />
					</li>
				))}
			</ul>
		</>
	);
};

export default EntityList;
