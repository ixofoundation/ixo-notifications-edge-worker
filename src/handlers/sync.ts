import { uploadUsersToAirtable } from '../utils/airtable';
import { uploadChunksAsync } from '../utils/misc';
import { User } from '../types/user';

export const syncUsersToAirtable = async (c) => {
	try {
		const data = await c.env.Notifications.prepare('SELECT * FROM users').all();

		console.log('data', data);

		const result = await uploadChunksAsync<User>(data.results, 10, (chunk) =>
			uploadUsersToAirtable(chunk, {
				apiKey: c.env.AIRTABLE_API_KEY,
				baseId: c.env.AIRTABLE_BASE_ID,
				tableName: c.env.AIRTABLE_TABLE_NOTIFICATION_USERS,
			}),
		);

		return c.json(result);
	} catch (error) {
		return c.text(error, 500);
	}
};
