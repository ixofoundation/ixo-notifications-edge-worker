import { uploadUserToAirtable } from '../utils/airtable';
import { User, UserRequest } from '../types/user';

export const readUsers = async (c) => {
	try {
		const dump = !!c.req.query('dump');
		const result = await c.env.Notifications.prepare(
			dump
				? 'SELECT * FROM users'
				: 'SELECT id, did, token, network, status, createdAt, updatedAt FROM users WHERE status = "active"',
		).all();

		return c.json(result?.results ?? []);
	} catch (error) {
		console.error('GET /v1/users', error);
		return c.text(error?.message ?? error, 500);
	}
};

export const readUserByDid = async (c) => {
	try {
		const did = c.req.param('did');
		const dump = !!c.req.query('dump');
		const result: User = await c.env.Notifications.prepare(
			dump
				? 'SELECT * FROM users WHERE did = ?'
				: 'SELECT id, did, token, network, status, createdAt, updatedAt FROM users WHERE did = ? AND status = "active"',
		)
			.bind(did)
			.first();

		return c.json(result);
	} catch (error) {
		console.error('GET /v1/users/:did', error);
		return c.text(error?.message ?? error, 500);
	}
};

export const createUser = async (c) => {
	try {
		const body: UserRequest = await c.req.json();

		if (!body.did) throw new Error('DID is required to register user for notifications');
		if (!body.token) throw new Error('Expo push token is required to register user for notifications');
		if (!body.network) throw new Error('Network is required to register user for notifications');

		const user = await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ?').bind(body.did).first();
		const result = await c.env.Notifications.prepare(
			user
				? 'UPDATE users SET token = ?2, network = ?3, status = ?4, version = ?5, updatedAt = DATETIME() WHERE did = ?1'
				: 'INSERT INTO users (did, token, network, status, version, createdAt, updatedAt) VALUES (?1, ?2, ?3, ?4, ?5, DATETIME(), DATETIME())',
		)
			.bind(body.did, body.token, body.network, body.status ?? 'active', body.version ?? null)
			.all();

		try {
			const userData = await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ?').bind(body.did).first();
			if (userData)
				await uploadUserToAirtable(userData, {
					apiKey: c.env.AIRTABLE_API_KEY,
					baseId: c.env.AIRTABLE_BASE_ID,
					tableName: c.env.AIRTABLE_TABLE_NOTIFICATION_USERS,
				});
		} catch (e) {
			console.error('uploadUserToAirtable', e);
		}

		return c.json(result?.success);
	} catch (error) {
		console.error('POST /v1/users', error);
		return c.text(error?.message ?? error, 500);
	}
};

export const updateUser = async (c) => {
	try {
		const did = c.req.param('did');
		const body: UserRequest = await c.req.json();
		const result = await c.env.Notifications.prepare(
			'UPDATE users SET token = ?2, network = ?3, status = ?4, version = ?5, updatedAt = DATETIME() WHERE did = ?1',
		)
			.bind(did, body.token, body.network, body.status ?? 'active', body.version ?? null)
			.all();

		try {
			const userData = await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ?').bind(body.did).first();
			if (userData)
				await uploadUserToAirtable(userData, {
					apiKey: c.env.AIRTABLE_API_KEY,
					baseId: c.env.AIRTABLE_BASE_ID,
					tableName: c.env.AIRTABLE_TABLE_NOTIFICATION_USERS,
				});
		} catch (e) {
			console.error('uploadUserToAirtable', e);
		}

		return c.json(result?.success);
	} catch (error) {
		console.error('put /v1/users/:did', error);
		return c.text(error?.message ?? error, 500);
	}
};

export const deleteUser = async (c) => {
	try {
		const did = c.req.param('did');
		const result = await c.env.Notifications.prepare('UPDATE users SET status = ?2 WHERE did = ?1')
			.bind(did, 'inactive')
			.all();

		try {
			const userData = await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ?').bind(did).first();
			if (userData)
				await uploadUserToAirtable(userData, {
					apiKey: c.env.AIRTABLE_API_KEY,
					baseId: c.env.AIRTABLE_BASE_ID,
					tableName: c.env.AIRTABLE_TABLE_NOTIFICATION_USERS,
				});
		} catch (e) {
			console.error('uploadUserToAirtable', e);
		}

		return c.json(result?.success);
	} catch (error) {
		console.error('DELETE /v1/users/:did', error);
		return c.text(error?.message ?? error, 500);
	}
};
