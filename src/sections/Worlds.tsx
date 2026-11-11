import EntityList, { type EntityColumn } from '../components/EntityList';
import { useFetch } from '../hooks/useFetch';
import { formatDate } from '../util/Dateparser';

interface WorldTypes {
	world_id: number;
	organization_id: string;
	world_name_en: string;
	order_number: number;
	created_at: string;
	deleted_at: null | string;
}

const Worlds = () => {
	const { data: worlds, error } = useFetch<WorldTypes>('/api/world');

	const worldColumns: EntityColumn<WorldTypes>[] = [
		{
			header: 'Name',
			render: (world) => world.world_name_en,
			cellClassName: 'entity-name-cell',
		},
		{
			header: 'Id',
			render: (world) => world.world_id,
		},
		{
			header: 'Created At',
			render: (world) => formatDate(world.created_at),
		},
	];

	const onNewWorldClick = (): void => {
		/* TODO implement new worlds addition */
	};
	const onDeleteClick = (): void => {
		/* TODO implement Deletion functionality for worlds */
	};
	const onEditClick = (): void => {
		/* TODO implement editing funtionality for worlds */
	};

	return (
		<section className='flex flex-col'>
			<EntityList
				title={'World control center'}
				error={error}
				buttonText={'+ Create New World'}
				onCreate={onNewWorldClick}
				data={worlds}
				columns={worldColumns}
				getKey={(world) => world.world_id}
				gridClassName='world-grid'
				onDelete={onDeleteClick}
				onEdit={onEditClick}
			/>
		</section>
	);
};

export default Worlds;
