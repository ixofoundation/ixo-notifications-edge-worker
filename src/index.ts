import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { cors } from 'hono/cors';

import {
	Notification,
	NotificationRequest,
	NotificationTemplate,
	NotificationTemplateRequest,
	NotificationV2Request,
} from './types/notification';
import { User, UserRequest, UserResponse } from './types/user';
import { validateNotificationLink } from './utils/notification';
import * as NotificationsV1 from './handlers/notifications';
import * as NotificationsV2 from './handlers/notificationsV2';

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
		const dump = !!c.req.query('dump');
		const result = dump
			? await c.env.Notifications.prepare('SELECT * FROM users').all()
			: await c.env.Notifications.prepare('SELECT * FROM users WHERE status = ?1').bind('active').all();
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
		const result = dump
			? await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ?1').bind(did).first()
			: await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ?1 AND status = ?2')
					.bind(did, 'active')
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
		const user = await c.env.Notifications.prepare('SELECT * FROM users WHERE did = ?1 and network = ?2')
			.bind(body.did, body.network)
			.first();
		const result = await c.env.Notifications.prepare(
			user
				? 'UPDATE users SET token = ?2, status = ? 4, updatedAt = DATETIME() WHERE did = ?1 AND network = ?3'
				: 'INSERT INTO users (did, token, network, status, updatedAt) VALUES (?1, ?2, ?3, ?4, DATETIME())',
		)
			.bind(body.did, body.token, body.network, body.status ?? 'active')
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
			'UPDATE users SET token = ?2, status = ?4, updatedAt = DATETIME() WHERE did = ?1 AND network = ?3',
		)
			.bind(did, body.token, body.network, body.network ?? 'active')
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
app.get('/v1/notifications', NotificationsV1.getNotifications);

app.get('/v1/notifications/did/:did', NotificationsV1.getNotificationsByDid);

app.get('/v1/notifications/id/:id', NotificationsV1.getNotificationById);

app.post('/v1/notifications/:userDid', NotificationsV1.saveNotification);

app.get('/v1/notifications/receipts', NotificationsV1.fetchNotificationReceipts);

app.patch('/v1/notifications/status/:id', NotificationsV1.updateNotificationStatus);

app.delete('/v1/notifications/:deleteId', NotificationsV1.deleteNotification);
// [END] notification routes

// [START] notification routes (v2)
app.get('/v2/notifications/templates', NotificationsV2.getNotificationTemplates);

app.get('/v2/notifications/templates/:id', NotificationsV2.getNotificationTemplateById);

app.post('/v2/notifications/templates', NotificationsV2.saveNotificationTemplate);

app.get('/v2/notifications', NotificationsV2.getNotifications);

app.get('/v2/notifications/id/:id', NotificationsV2.getNotificationById);

app.get('/v2/notifications/:network/:did', NotificationsV2.getNotificationByNetworkAndDid);

app.post('/v2/notifications/:network/:did', NotificationsV2.saveNotification);

app.get('/v2/notifications/receipts', NotificationsV2.fetchNotificationReceipts);

app.patch('/v2/notifications/status/:id', NotificationsV2.updateNotificationStatusById);

app.delete('/v2/notifications/:deleteId', NotificationsV2.deleteNotification);
// [END] notification routes

export default app;
