import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { cors } from 'hono/cors';

import { Notification, NotificationRequest } from './types/notification';
import { User, UserRequest } from './types/user';

const app = new Hono<{
	Bindings: {
		AUTHORIZATION: string;
		Notifications: D1Database;
		// AIRTABLE_API_KEY: string;
		// AIRTABLE_BASE_URL: string;
		// AIRTABLE_BASE_ID: string;
		// AIRTABLE_TABLE_USERS: string;
		// AIRTABLE_TABLE_NOTIFICATIONS: string;
	};
}>();

app.use('*', poweredBy());

app.use('*', cors());

app.use('*', async (c, next) => {
	if (c.req.header('Authorization') === c.env.AUTHORIZATION) {
		await next();
	} else {
		return c.text('Authorization Failed', 401);
	}
});

app.get('/', (c) => {
	return c.text('Hello IXO!');
});

// [START] user routes
app.get('/v1/users', async (c) => {
	try {
		const result = await c.env.Notifications.prepare('SELECT * FROM users').all();
		return c.json(result?.results ?? []);
	} catch (error) {
		console.error('GET /v1/users', error);
		return c.text(error?.message ?? error, 500);
	}
});

app.get('/v1/users/:did', async (c) => {
	try {
		const did = c.req.param('did');
		const result = await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ?').bind(did).first();
		return c.json(result);
	} catch (error) {
		console.error('GET /v1/users/:did', error);
		return c.text(error?.message ?? error, 500);
	}
});

app.post('/v1/users', async (c) => {
	try {
		const body: UserRequest = await c.req.json();
		const user = await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ?1').bind(body.did).first();
		const result = await c.env.Notifications.prepare(
			user
				? 'UPDATE users SET token = ?2, network = ?3, updatedAt = DATETIME() WHERE did = ?1'
				: 'INSERT INTO users (did, token, network, updatedAt) VALUES (?1, ?2, ?3, DATETIME())',
		)
			.bind(body.did, body.token, body.network)
			.all();
		return c.json(result?.success);
	} catch (error) {
		console.error('POST /v1/users', error);
		return c.text(error?.message ?? error, 500);
	}
});

app.put('/v1/users/:did', async (c) => {
	try {
		const did = c.req.param('did');
		const body: UserRequest = await c.req.json();
		const result = await c.env.Notifications.prepare(
			'UPDATE users SET token = ?2, network = ?3, updatedAt = DATETIME() WHERE did = ?1',
		)
			.bind(did, body.token, body.network)
			.all();
		return c.json(result?.success);
	} catch (error) {
		console.error('put /v1/users/:did', error);
		return c.text(error?.message ?? error, 500);
	}
});

app.delete('/v1/users/:did', async (c) => {
	try {
		const did = c.req.param('did');
		const result = await c.env.Notifications.prepare('DELETE FROM users WHERE did = ?').bind(did).all();
		return c.json(result?.success);
	} catch (error) {
		console.error('DELETE /v1/users/:did', error);
		return c.text(error?.message ?? error, 500);
	}
});
// [END] user routes

// [START] notification routes
app.get('/v1/notifications', async (c) => {
	try {
		const result = await c.env.Notifications.prepare('SELECT * FROM notifications').all();
		return c.json(result?.results);
	} catch (error) {
		console.error('GET /v1/notifications', error);
		return c.text(error, 500);
	}
});

app.get('/v1/notifications/did/:did', async (c) => {
	try {
		const did = c.req.param('did');
		const date = c.req.query('date');
		const dateObj = date ? new Date(date) : new Date();
		const expireAt = dateObj.toISOString().replace('T', ' ').slice(0, -5);
		const result = await c.env.Notifications.prepare('SELECT * FROM notifications WHERE did = ?1 AND expireAt >= ?2')
			.bind(did, expireAt)
			.all();
		return c.json(result?.results ?? []);
	} catch (error) {
		console.error('GET /v1/notifications/did/:did', error);
		return c.text(error, 500);
	}
});

app.get('/v1/notifications/id/:id', async (c) => {
	try {
		const id = c.req.param('id');
		const result = await c.env.Notifications.prepare('SELECT * FROM notifications WHERE id = ?').bind(id).first();
		return c.json(result);
	} catch (error) {
		console.error('GET /v1/notifications/:id', error);
		return c.text(error, 500);
	}
});

app.post('/v1/notifications/:did', async (c) => {
	try {
		const did = c.req.param('did');
		const user: User = await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ?').bind(did).first();

		if (!user) throw new Error(`User with did '${did}' not found`);

		const body: NotificationRequest = await c.req.json();
		const now = new Date();
		const notificationResult = await c.env.Notifications.prepare(
			'INSERT INTO notifications (title, message, status, createdAt, expireAt, did, type) values (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
		)
			.bind(
				body.title,
				body.message,
				body.status,
				now.toISOString().replace('T', ' ').slice(0, -5),
				body.expireAt,
				did,
				body.type,
			)
			.run();
		const id = notificationResult.meta.last_row_id;
		const expo = new Expo();

		if (!Expo.isExpoPushToken(user.token)) throw new Error(`Push token ${user.token} is not a valid Expo push token`);

		const messages: ExpoPushMessage[] = [
			{
				to: user.token,
				sound: 'default',
				expiration: Math.ceil(new Date(body.expireAt).getTime() ?? 0),
				title: body.title,
				body: body.message,
				data: { id, type: body.type, expire: body.expireAt },
			},
		];
		const [chunk] = expo.chunkPushNotifications(messages);
		const [ticket]: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);
		const result =
			ticket.status === 'ok'
				? await c.env.Notifications.prepare('UPDATE notifications SET ticket = ?1 WHERE id = ?2')
						.bind(ticket.id, id)
						.run()
				: await c.env.Notifications.prepare('UPDATE notifications SET error = ?1 WHERE id = ?2')
						.bind(ticket.details.error, id)
						.run();

		return c.json(result?.success);
	} catch (error) {
		console.error('POST /v1/notifications', error);
		return c.text(error, 500);
	}
});

app.get('/v1/notifications/receipts', async (c) => {
	try {
		const result = await c.env.Notifications.prepare(
			'SELECT * FROM notifications WHERE ticket IS NOT NULL AND receipt IS NULL',
		).all();

		if (!result.results?.length) return c.json(result?.success);

		const expo = new Expo();
		const receiptIds = result.results.map((r: Notification) => r.ticket);

		let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

		for (const chunk of receiptIdChunks) {
			try {
				let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
				console.log(receipts);

				// The receipts specify whether Apple or Google successfully received the
				// notification and information about an error, if one occurred.
				for (const receiptId in receipts) {
					const { status, details } = receipts[receiptId];
					const notificationId =
						(result.results.find((r: Notification) => r.ticket === receiptId) as Notification)?.id ?? 0;

					if (status === 'ok') {
						await c.env.Notifications.prepare('UPDATE notifications SET receipt = ?1 WHERE id = ?2')
							.bind(status, notificationId)
							.run();
					} else {
						// The error codes are listed in the Expo documentation:
						// https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
						// You must handle the errors appropriately.
						if (details?.error)
							await c.env.Notifications.prepare('UPDATE notifications SET receipt = ?1, error = ?2 WHERE id = ?3')
								.bind(status, details.error, notificationId)
								.run();
					}
				}
			} catch (error) {
				console.error(error);
			}
		}
		return c.json(result?.success);
	} catch (error) {
		console.error('GET /v1/notifications/tickets', error);
		return c.text(error, 500);
	}
});

app.patch('/v1/notifications/status/:id', async (c) => {
	try {
		const id = c.req.param('id');
		const body: { status: string } = await c.req.json();
		const result = await c.env.Notifications.prepare('UPDATE notifications SET status = ?1 WHERE id = ?2')
			.bind(body.status, Number(id ?? 0))
			.all();
		return c.json(result?.success);
	} catch (error) {
		return c.text(error, 500);
	}
});

app.delete('/v1/notifications/:id', async (c) => {
	try {
		const id = c.req.param('id');
		const result = await c.env.Notifications.prepare('DELETE FROM notifications WHERE id = ?')
			.bind(Number(id ?? 0))
			.all();
		return c.json(result?.success);
	} catch (error) {
		return c.text(error, 500);
	}
});
// [END] notification routes

export default app;
