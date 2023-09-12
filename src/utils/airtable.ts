import { NotificationUploadRequest } from '../types/notification';
import { ApiOptions } from '../types/airtable';
import { User } from '../types/user';

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

export const uploadUserToAirtable = async (user: User, options: ApiOptions) =>
	await fetch(`https://api.airtable.com/v0/${options.baseId}/${options.tableName}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${options.apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			records: [
				{
					fields: user,
				},
			],
		}),
	}).then((res) => res.json());

export const uploadUsersToAirtable = async (users: User[], options: ApiOptions) =>
	await fetch(`https://api.airtable.com/v0/${options.baseId}/${options.tableName}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${options.apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			records: users.map((user) => ({
				fields: user,
			})),
		}),
	}).then((res) => res.json());
