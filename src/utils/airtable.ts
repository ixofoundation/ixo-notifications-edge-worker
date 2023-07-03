import { ApiOptions } from '../types/airtable';
import { NotificationUploadRequest } from '../types/notification';

export const uploadNotificationToAirtable = async (notification: NotificationUploadRequest, options: ApiOptions) =>
	await fetch(`https://api.airtable.com/v0/${options.baseId}/${options.tableName}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${options.apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			records: [
				{
					fields: notification,
				},
			],
		}),
	}).then((res) => res.json());
