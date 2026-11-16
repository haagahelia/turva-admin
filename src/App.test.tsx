import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { loadSession } from './auth/session';
import { logInAsAdmin, makeToken, renderWithAuth } from './test/auth';
import { mockFetch } from './test/mockFetch';

const quizzes = [
	{
		quiz_id: 11,
		quiz_name_fi: 'Paloturvallisuus',
		quiz_name_en: 'Fire safety',
		quiz_content: [],
		world_id: 3,
		order_number: 1,
		created_at: '2025-01-15T10:30:00.000Z',
		deleted_at: null,
	},
];

const worlds = [
	{
		world_id: 3,
		organization_id: 'org-1',
		world_name_en: 'Campus world',
		order_number: 1,
		created_at: '2025-02-01T08:00:00.000Z',
		deleted_at: null,
	},
];

const crisisTeam = [
	{
		contact_id: 7,
		name_en: 'Jane Doe',
		name_fi: 'Jane Doe',
		order_number: '1',
		organization_id: 1,
		phone: '+358 40 123 4567',
		role_en: 'Security lead',
		role_fi: 'Turvallisuusvastaava',
		created_at: '2025-03-10T12:00:00.000Z',
		deleted_at: null,
	},
];

/** Renders the app at `path` as a logged-in admin. */
const renderAt = (path: string) => {
	logInAsAdmin();
	return renderWithAuth(<App />, path);
};

describe('Authentication', () => {
	beforeEach(() => {
		mockFetch({ '/api/quiz': { body: quizzes } });
	});

	it('redirects to the login page when not logged in', () => {
		renderWithAuth(<App />, '/worlds');

		expect(
			screen.getByRole('heading', { name: 'Turva Dashboard' }),
		).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Send code' })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Worlds' })).not.toBeInTheDocument();
	});

	it('treats an expired stored token as logged out', () => {
		logInAsAdmin(makeToken(-60));
		renderWithAuth(<App />, '/quizzes');

		expect(screen.getByRole('button', { name: 'Send code' })).toBeInTheDocument();
		expect(loadSession()).toBeNull();
	});

	it("shows the admin's name in the side panel", async () => {
		renderAt('/quizzes');

		expect(await screen.findByText('Admin User')).toBeInTheDocument();
	});

	it('logs out and returns to the login page', async () => {
		const user = userEvent.setup();
		renderAt('/quizzes');

		await user.click(screen.getByRole('button', { name: 'Logout' }));

		expect(screen.getByRole('button', { name: 'Send code' })).toBeInTheDocument();
		expect(loadSession()).toBeNull();
	});
});

describe('App routing', () => {
	beforeEach(() => {
		mockFetch({
			'/api/quiz': { body: quizzes },
			'/api/world': { body: worlds },
			'/api/crisis-team': { body: crisisTeam },
		});
	});

	it('redirects / to the quizzes view', async () => {
		renderAt('/');

		expect(
			await screen.findByRole('heading', { name: 'Quiz control center' }),
		).toBeInTheDocument();
	});

	it('redirects an unknown path to the quizzes view', async () => {
		renderAt('/does-not-exist');

		expect(
			await screen.findByRole('heading', { name: 'Quiz control center' }),
		).toBeInTheDocument();
	});

	it('shows a side navigation link for each view', () => {
		renderAt('/quizzes');

		expect(screen.getByRole('link', { name: 'Quizzes' })).toHaveAttribute(
			'href',
			'/quizzes',
		);
		expect(screen.getByRole('link', { name: 'Worlds' })).toHaveAttribute(
			'href',
			'/worlds',
		);
		expect(screen.getByRole('link', { name: 'Crisis team' })).toHaveAttribute(
			'href',
			'/crisis-team',
		);
	});

	it('navigates between views with the side navigation', async () => {
		const user = userEvent.setup();
		renderAt('/quizzes');

		await user.click(screen.getByRole('link', { name: 'Worlds' }));
		expect(
			await screen.findByRole('heading', { name: 'World control center' }),
		).toBeInTheDocument();

		await user.click(screen.getByRole('link', { name: 'Crisis team' }));
		expect(
			await screen.findByRole('heading', { name: 'Crisis team control center' }),
		).toBeInTheDocument();

		await user.click(screen.getByRole('link', { name: 'Quizzes' }));
		expect(
			await screen.findByRole('heading', { name: 'Quiz control center' }),
		).toBeInTheDocument();
	});

	it('highlights the link of the current view', () => {
		renderAt('/worlds');

		expect(screen.getByRole('link', { name: 'Worlds' })).toHaveClass(
			'bg-[#0472ED]',
		);
		expect(screen.getByRole('link', { name: 'Quizzes' })).not.toHaveClass(
			'bg-[#0472ED]',
		);
	});
});

describe('Sections', () => {
	const sections = [
		{
			path: '/quizzes',
			endpoint: '/api/quiz',
			body: quizzes,
			expectedTexts: ['Fire safety', '11', '3'],
			createButton: '+ Create New Quiz',
		},
		{
			path: '/worlds',
			endpoint: '/api/world',
			body: worlds,
			expectedTexts: ['Campus world', '3'],
			createButton: '+ Create New World',
		},
		{
			path: '/crisis-team',
			endpoint: '/api/crisis-team',
			body: crisisTeam,
			expectedTexts: ['Jane Doe', '7', 'Security lead', '+358 40 123 4567'],
			createButton: '+ Add New Member',
		},
	];

	describe.each(sections)(
		'$path',
		({ path, endpoint, body, expectedTexts, createButton }) => {
			it(`fetches ${endpoint} and shows the received rows`, async () => {
				const fetchMock = mockFetch({ [endpoint]: { body } });
				renderAt(path);

				const row = await within(screen.getByRole('main')).findByRole(
					'listitem',
				);
				for (const text of expectedTexts) {
					expect(row).toHaveTextContent(text);
				}
				expect(fetchMock).toHaveBeenCalledWith(endpoint);
				expect(
					screen.getByRole('button', { name: createButton }),
				).toBeInTheDocument();
			});

			it('shows the API error when the request fails', async () => {
				mockFetch({
					[endpoint]: {
						status: 503,
						statusText: 'Service Unavailable',
						body: {},
					},
				});
				renderAt(path);

				expect(
					await screen.findByText(
						'Request failed with 503: Service Unavailable',
					),
				).toBeInTheDocument();
				expect(
					within(screen.getByRole('main')).queryAllByRole('listitem'),
				).toHaveLength(0);
			});
		},
	);
});
