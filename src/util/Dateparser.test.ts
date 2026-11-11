import { describe, expect, it } from 'vitest';
import { formatDate } from './Dateparser';

describe('formatDate', () => {
	it('formats an ISO timestamp as a readable local date and time', () => {
		// The exact format depends on the machine locale (e.g. "1/15/2025, 10:30:00 AM"
		// or "15.1.2025 klo 10.30.00"), so only check the parts every locale shows.
		const result = formatDate('2025-01-15T10:30:00.000Z');

		expect(result).toContain('2025');
		expect(result).toContain('15');
		expect(result).toMatch(/10\D30/);
	});

	it('returns "Invalid Date" for a value that is not a date', () => {
		expect(formatDate('not-a-date')).toBe('Invalid Date');
	});
});
