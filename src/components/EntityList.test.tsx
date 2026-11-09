import type { ComponentProps } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EntityList, { type EntityColumn } from './EntityList';

interface Item {
	id: number;
	name: string;
}

const items: Item[] = [
	{ id: 1, name: 'Alpha' },
	{ id: 2, name: 'Beta' },
];

const columns: EntityColumn<Item>[] = [
	{ header: 'Name', render: (item) => item.name },
	{ header: 'Id', render: (item) => item.id },
];

const renderList = (
	overrides: Partial<ComponentProps<typeof EntityList<Item>>> = {},
) => {
	const props = {
		title: 'Item control center',
		error: null,
		buttonText: '+ Create New Item',
		onCreate: vi.fn(),
		onDelete: vi.fn(),
		onEdit: vi.fn(),
		data: items,
		columns,
		getKey: (item: Item) => item.id,
		gridClassName: 'item-grid',
		...overrides,
	};
	render(<EntityList {...props} />);
	return props;
};

describe('EntityList', () => {
	it('shows the title as a heading', () => {
		renderList();

		expect(
			screen.getByRole('heading', { name: 'Item control center' }),
		).toBeInTheDocument();
	});

	it('shows a header for each column plus the actions column', () => {
		renderList();

		expect(screen.getByText('Name')).toBeInTheDocument();
		expect(screen.getByText('Id')).toBeInTheDocument();
		expect(screen.getByText('Actions')).toBeInTheDocument();
	});

	it('shows one row per item with the rendered column values', () => {
		renderList();

		const rows = screen.getAllByRole('listitem');
		expect(rows).toHaveLength(2);
		expect(within(rows[0]).getByText('Alpha')).toBeInTheDocument();
		expect(within(rows[0]).getByText('1')).toBeInTheDocument();
		expect(within(rows[1]).getByText('Beta')).toBeInTheDocument();
		expect(within(rows[1]).getByText('2')).toBeInTheDocument();
	});

	it('shows no rows when there is no data', () => {
		renderList({ data: [] });

		expect(screen.queryAllByRole('listitem')).toHaveLength(0);
	});

	it('shows the error message when there is an error', () => {
		renderList({ error: 'Request failed with 500: Internal Server Error' });

		expect(
			screen.getByText('Request failed with 500: Internal Server Error'),
		).toBeInTheDocument();
	});

	it('calls onCreate when the create button is clicked', async () => {
		const user = userEvent.setup();
		const props = renderList();

		await user.click(screen.getByRole('button', { name: '+ Create New Item' }));

		expect(props.onCreate).toHaveBeenCalledOnce();
	});

	it('calls onDelete with the clicked row item', async () => {
		const user = userEvent.setup();
		const props = renderList();

		const secondRow = screen.getAllByRole('listitem')[1];
		await user.click(within(secondRow).getByRole('button', { name: 'Delete' }));

		expect(props.onDelete).toHaveBeenCalledExactlyOnceWith(items[1]);
		expect(props.onEdit).not.toHaveBeenCalled();
	});

	it('calls onEdit with the clicked row item', async () => {
		const user = userEvent.setup();
		const props = renderList();

		const firstRow = screen.getAllByRole('listitem')[0];
		await user.click(within(firstRow).getByRole('button', { name: 'Edit' }));

		expect(props.onEdit).toHaveBeenCalledExactlyOnceWith(items[0]);
		expect(props.onDelete).not.toHaveBeenCalled();
	});
});
