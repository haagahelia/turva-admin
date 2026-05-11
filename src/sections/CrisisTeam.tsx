import { useEffect, useState } from 'react';
import EntityList, { type EntityColumn } from '../components/EntityList';
import { formatDate } from '../util/Dateparser';

interface CrisisTeamTypes {
	contact_id: number;
	name_en: string;
	name_fi: string;
	order_number: string;
	organization_id: number;
	phone: string;
	role_en: string;
	role_fi: string;
	created_at: string;
	deleted_at: null | string;
}

const CrisisTeam = () => {
	const [teamMembers, setTeamMembers] = useState<CrisisTeamTypes[]>([]);
	const [error, setError] = useState<string | null>(null);

	const crisisTeamColumns: EntityColumn<CrisisTeamTypes>[] = [
		{
			header: 'Name',
			render: (member) => member.name_en,
			cellClassName: 'entity-name-cell',
		},
		{
			header: 'Contact Id',
			render: (member) => member.contact_id,
		},
		{
			header: 'Role',
			render: (member) => member.role_en,
		},
		{
			header: 'Phone',
			render: (member) => member.phone,
		},
		{
			header: 'Created At',
			render: (member) => formatDate(member.created_at),
		},
	];

	const fetchQuizzes = () => {
		fetch('/api/crisis-team')
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`Request failed with ${response.status}: ${response.statusText}`,
					);
				}

				return response.json();
			})
			.then((data) => setTeamMembers(data))
			.catch((fetchError: Error) => setError(fetchError.message));
	};

	useEffect(() => {
		fetchQuizzes();
	}, []);

	const onNewMemberClick = (): void => {
		/* TODO implement new crisis team member addition */
	};
	const onDeleteClick = (): void => {
		/* TODO implement Deletion functionality for crisis team*/
	};
	const onEditClick = (): void => {
		/* TODO implement editing funtionality for crisis team */
	};

	return (
		<section className='flex flex-col'>
			<EntityList
				title={'Crisis team control center'}
				error={error}
				buttonText={'+ Add New Member'}
				onCreate={onNewMemberClick}
				data={teamMembers}
				columns={crisisTeamColumns}
				getKey={(teamMembers) => teamMembers.contact_id}
				gridClassName={'crisis-team-grid'}
				onDelete={onDeleteClick}
				onEdit={onEditClick}
			/>
		</section>
	);
};

export default CrisisTeam;
