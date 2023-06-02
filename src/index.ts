import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { cors } from 'hono/cors';

import { Notification, NotificationRequest } from './types/notification';
import { User, UserRequest, UserResponse } from './types/user';

const app = new Hono<{
	Bindings: {
		AUTHORIZATION: string;
		NETWORK: 'devnet' | 'testnet' | 'mainnet';
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
});

app.get('/v1/users/:did', async (c) => {
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
});

app.post('/v1/users', async (c) => {
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
			'UPDATE users SET token = ?2, network = ?3, status = ?4, version = ?5, updatedAt = DATETIME() WHERE did = ?1',
		)
			.bind(did, body.token, body.network, body.status ?? 'active', body.version ?? null)
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
		const result = await c.env.Notifications.prepare('UPDATE users SET status = ?2 WHERE did = ?1')
			.bind(did, 'inactive')
			.all();

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
		const dump = !!c.req.query('dump');
		const result = await c.env.Notifications.prepare(
			dump
				? 'SELECT * FROM notifications'
				: 'SELECT id, did, title, subtitle, message, image, link, linkLabel, type, status, read, expireAt, version, network, createdAt FROM notifications WHERE status = "active"',
		).all();

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
		const dump = !!c.req.query('dump');
		const dateObj = date ? new Date(date) : new Date();
		const expireAt = dateObj.toISOString().replace('T', ' ').slice(0, -5);
		const result = dump
			? await c.env.Notifications.prepare('SELECT * FROM notifications WHERE did = ?1').bind(did).all()
			: await c.env.Notifications.prepare(
					'SELECT id, did, title, subtitle, message, image, link, linkLabel, type, status, read, expireAt, version, network, createdAt FROM notifications WHERE did = ?1 AND (expireAt IS NULL OR expireAt >= ?2) AND status = "active"',
			  )
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
		const dump = !!c.req.query('dump');
		const result = await c.env.Notifications.prepare(
			dump
				? 'SELECT * FROM notifications WHERE id = ?'
				: 'SELECT id, did, title, subtitle, message, image, link, linkLabel, type, status, read, expireAt, version, network, createdAt FROM notifications WHERE id = ? AND status = "active"',
		)
			.bind(id)
			.first();

		return c.json(result);
	} catch (error) {
		console.error('GET /v1/notifications/:id', error);
		return c.text(error, 500);
	}
});

app.get('/v1/notifications/remoteId/:remoteId', async (c) => {
	try {
		const remoteId = c.req.param('remoteId');
		const result = await c.env.Notifications.prepare('SELECT * FROM notifications WHERE remoteId = ?')
			.bind(remoteId)
			.first();

		return c.json(result);
	} catch (error) {
		console.error('GET /v1/notifications/:remoteId', error);
		return c.text(error, 500);
	}
});

app.post('/v1/notifications/:did', async (c) => {
	try {
		const did = c.req.param('did');
		const body: NotificationRequest = await c.req.json();

		if (!did) throw new Error('DID is required to send notifications');
		if (!body.id) throw new Error('Remote ID is required to send notifications');
		if (!body.title) throw new Error('Title is required to send notifications');
		if (!body.message) throw new Error('Message is required to send notifications');

		const user: User = await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ? AND status = "active"')
			.bind(did)
			.first();

		if (!user) throw new Error(`User with did '${did}' not found`);

		const now = new Date();
		const notificationResult = await c.env.Notifications.prepare(
			'INSERT INTO notifications (remoteId, did, title, subtitle, message, image, link, linkLabel, type, status, expireAt, version, network, createdAt, updatedAt) values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, DATETIME(), DATETIME())',
		)
			.bind(
				body.id,
				did,
				body.title,
				body.subtitle ?? null,
				body.message,
				body.image ?? null,
				body.link ?? null,
				body.linkLabel ?? null,
				body.type ?? null,
				body.status,
				body.expireAt ?? null,
				body.version ?? 1,
				c.env.NETWORK,
				// now.toISOString().replace('T', ' ').slice(0, -5),
			)
			.run();
		const id = notificationResult.meta.last_row_id;

		if (body.status !== 'active') return c.json({ success: false, id, error: 'Notification status is not active' });

		const expo = new Expo();

		if (!Expo.isExpoPushToken(user.token)) throw new Error(`${user.token} is not a valid Expo push token`);

		const messages: ExpoPushMessage[] = [
			{
				to: user.token,
				sound: 'default',
				expiration: body.expireAt ? Math.ceil(new Date(body.expireAt).getTime() ?? 0) : undefined,
				title: body.title,
				subtitle: body.subtitle ?? undefined,
				body: body.message,
				data: {
					id,
					did,
					title: body.title,
					subtitle: body.subtitle,
					message: body.message,
					image: body.image,
					link: body.link,
					linkLabel: body.linkLabel,
					type: body.type,
					status: body.status,
					expireAt: body.expireAt,
					version: body.version,
					createdAt: now.toISOString().replace('T', ' ').slice(0, -5),
					network: c.env.NETWORK,
				},
			},
		];
		const [chunk] = expo.chunkPushNotifications(messages);
		const [ticket]: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);
		const result =
			ticket.status === 'ok'
				? await c.env.Notifications.prepare('UPDATE notifications SET ticket = ?1, sentAt = DATETIME() WHERE id = ?2')
						.bind(ticket.id, id)
						.run()
				: await c.env.Notifications.prepare('UPDATE notifications SET error = ?1 WHERE id = ?2')
						.bind(ticket.details.error, id)
						.run();

		return c.json({ success: result?.success, id });
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

		if (!result.results?.length) return c.json([]);

		const expo = new Expo();
		const receiptIds = result.results.map((r: Notification) => r.ticket);

		let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

		for (const chunk of receiptIdChunks) {
			try {
				let receipts = await expo.getPushNotificationReceiptsAsync(chunk);

				// The receipts specify whether Apple or Google successfully received the
				// notification and information about an error, if one occurred.
				for (const receiptId in receipts) {
					const { status, details } = receipts[receiptId];
					const notificationId =
						(result.results.find((r: Notification) => r.ticket === receiptId) as Notification)?.id ?? 0;

					if (status === 'ok') {
						await c.env.Notifications.prepare(
							'UPDATE notifications SET receipt = ?1, updatedAt = DATETIME() WHERE id = ?2',
						)
							.bind(status, notificationId)
							.run();
					} else {
						// The error codes are listed in the Expo documentation:
						// https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
						// You must handle the errors appropriately.
						if (details?.error)
							await c.env.Notifications.prepare(
								'UPDATE notifications SET receipt = ?1, error = ?2, updatedAt = DATETIME() WHERE id = ?3',
							)
								.bind(status, details.error ?? '', notificationId)
								.run();
					}
				}
			} catch (error) {
				console.error(error);
			}
		}

		const notificationIds = result.results.map((r: Notification) => r.id);
		const receiptResult = await c.env.Notifications.prepare(
			`SELECT * FROM notifications WHERE id IN (${notificationIds.join(', ')})`,
		).all();
		return c.json(receiptResult.results);
	} catch (error) {
		console.error('GET /v1/notifications/receipts', error);
		return c.text(error, 500);
	}
});

app.patch('/v1/notifications/read/:id', async (c) => {
	try {
		const id = c.req.param('id');
		const result = await c.env.Notifications.prepare(
			'UPDATE notifications SET read = 1, updatedAt = DATETIME() WHERE id = ?',
		)
			.bind(Number(id ?? 0))
			.all();
		return c.json(result?.success);
	} catch (error) {
		return c.text(error, 500);
	}
});

app.patch('/v1/notifications/status/:id', async (c) => {
	try {
		const id = c.req.param('id');
		const body: { status: string } = await c.req.json();
		const result = await c.env.Notifications.prepare(
			'UPDATE notifications SET status = ?1, updatedAt = DATETIME() WHERE id = ?2',
		)
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
		const result = await c.env.Notifications.prepare(
			'UPDATE notifications SET status = "inactive", updatedAt = DATETIME() WHERE id = ?',
		)
			.bind(Number(id ?? 0))
			.all();
		return c.json(result?.success);
	} catch (error) {
		return c.text(error, 500);
	}
});
// [END] notification routes

export default app;
