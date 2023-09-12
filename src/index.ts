import { Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';
import { cors } from 'hono/cors';

import { createUser, deleteUser, readUserByDid, readUsers, updateUser } from './handlers/user';
import { syncUsersToAirtable } from './handlers/sync';
import {
	createNotification,
	readNotificationByDid,
	readNotificationById,
	readNotificationByRemoteId,
	readNotifications,
	readNotificationReceipts,
	updateNotificationAsRead,
	updateNotificationStatus,
	deleteNotification,
	uploadNotification,
	uploadPurchaseNotification,
} from './handlers/notification';

const app = new Hono<{
	Bindings: {
		AUTHORIZATION: string;
		Notifications: D1Database;
		AIRTABLE_API_KEY: string;
		AIRTABLE_BASE_ID: string;
		AIRTABLE_TABLE_NOTIFICATIONS: string;
		TESTERS: KVNamespace;
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
app.get('/v1/users', readUsers);

app.get('/v1/users/:did', readUserByDid);

app.post('/v1/users', createUser);

app.put('/v1/users/:did', updateUser);

app.delete('/v1/users/:did', deleteUser);
// [END] user routes

// [START] notification routes
app.get('/v1/notifications', readNotifications);

app.get('/v1/notifications/did/:did', readNotificationByDid);

app.get('/v1/notifications/id/:id', readNotificationById);

app.get('/v1/notifications/remoteId/:remoteId', readNotificationByRemoteId);

app.post('/v1/notifications', uploadNotification);

app.post('/v1/notifications/purchase', uploadPurchaseNotification);

app.post('/v1/notifications/did/:did', createNotification);

app.get('/v1/notifications/receipts', readNotificationReceipts);

app.patch('/v1/notifications/read/:id', updateNotificationAsRead);

app.patch('/v1/notifications/status/:id', updateNotificationStatus);

app.delete('/v1/notifications/:id', deleteNotification);
// [END] notification routes

// [START] sync routes
app.get('/v1/sync/users/airtable', syncUsersToAirtable);
// [END] sync routes

export default app;
