import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';
import { cors } from 'hono/cors';

import { Notification } from './types/notification';
import { User } from './types/user';

const app = new Hono<{
	Bindings: {
		AUTHORIZATION: string;
		Notifications: D1Database;
		Users: D1Database;
	};
}>();

app.use('*', poweredBy());

app.use('*', cors());

app.use('*', async (c, next) => {
	if (c.req.header('Authorization') === c.env.AUTHORIZATION) {
		await next();
	} else {
		return c.text('Authorization Failed');
	}
});

app.get('/', (c) => {
	return c.text('Hello IXO!');
});

app.get('/getUser/:did', async (c) => {
	try {
		const did = c.req.param('did');
		console.log({ did });
		const result = await c.env.Users.prepare('SELECT * FROM users WHERE did = ?').bind(did).first();
		return c.json(result);
	} catch (error) {
		console.error(error);
		return c.text(error?.message ?? error);
	}
});

app.post('/addUser', async (c) => {
	try {
		const body: User = await c.req.json();
		const result = await c.env.Users.prepare('INSERT INTO users (did, token, lastUpdated) VALUES (?1, ?2, DATETIME())')
			.bind(body.did, body.token)
			.all();
		return c.json(result?.success);
	} catch (error) {
		console.error(error);
		return c.text(error?.message ?? error);
	}
});

app.post('/updateUser', async (c) => {
	try {
		const body: User = await c.req.json();
		const result = await c.env.Users.prepare('UPDATE users SET token = ?2, lastUpdated = DATETIME() WHERE did = ?1')
			.bind(body.did, body.token)
			.all();
		return c.json(result?.success);
	} catch (error) {
		console.error(error);
		return c.text(error?.message ?? error);
	}
});

app.post('/addOrUpdateUser', async (c) => {
	try {
		const body: User = await c.req.json();
		const user = await c.env.Users.prepare('SELECT * FROM users WHERE did = ?').bind(body.did).first();
		const result = await c.env.Users.prepare(
			user
				? 'UPDATE users SET token = ?2, lastUpdated = DATETIME() WHERE did = ?1'
				: 'INSERT INTO users (did, token, lastUpdated) VALUES (?1, ?2, DATETIME())',
		)
			.bind(body.did, body.token)
			.all();
		return c.json(result?.success);
	} catch (error) {
		console.error(error);
		return c.text(error?.message ?? error);
	}
});

app.post('/createNotification', async (c) => {
	try {
		const body: Notification = await c.req.json();
		const result = await c.env.Notifications.prepare(
			'INSERT INTO notifications (message, status, expires, did, type) values (?, ?, ?, ?, ?)',
		)
			.bind(body.message, body.status, body.expires, body.did, body.type)
			.all();
		return c.json(result);
	} catch (error) {
		return c.text(error);
	}
});

app.post('/storeNotificationsAirtable', async (c) => {
	try {
		const body: Notification = await c.req.json();
		const result = await c.env.Notifications.prepare(
			'INSERT INTO notifications (message, status, expires, did, type) values (?, ?, ?, ?, ?)',
		)
			.bind(body.message, body.status, body.expires, body.did, body.type)
			.all();
		return c.json(result);
	} catch (error) {
		return c.text(error);
	}
});

app.get('/updateNotification/:id/:status', async (c) => {
	try {
		const id = c.req.param('id');
		const status = c.req.param('status');
		const result = await c.env.Notifications.prepare('UPDATE notifications SET status = ? WHERE id = ?')
			.bind(status, +id)
			.all();
		return c.json(result);
	} catch (error) {
		return c.text(error);
	}
});

app.get('/getNotification/:did', async (c) => {
	try {
		const did = c.req.param('did');
		const result = await c.env.Notifications.prepare('SELECT * FROM notifications WHERE did = ?').bind(did).all();
		return c.json(result);
	} catch (error) {
		return c.text(error);
	}
});

export default app;
