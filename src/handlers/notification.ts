import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

import { Notification, NotificationRequest, NotificationUploadRequest } from '../types/notification';
import { User } from '../types/user';

export const readNotifications = async (c) => {
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
};

export const readNotificationByDid = async (c) => {
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
};

export const readNotificationById = async (c) => {
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
};

export const readNotificationByRemoteId = async (c) => {
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
};

export const uploadNotification = async (c) => {
	try {
		const body: NotificationUploadRequest = await c.req.json();
		const upload: boolean = !c.req.query('preview');

		if (!body.did) throw new Error('Did is required to upload notification');
		if (!body.title) throw new Error('Title is required to upload notification');
		if (!body.message) throw new Error('Message is required to upload notification');
		if (body.expireAt && !new Date(body.expireAt))
			throw new Error('Valid expiration date required to upload notification');
		if (
			body.image &&
			!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(
				body.image,
			)
		)
			throw new Error('Valid image url (https only) required to upload notification');
		if (!['test', 'purchase'].includes(body.type)) throw new Error('Valid type required to upload notification');
		if (!['mainnet', 'testnet', 'devnet'].includes(body.network))
			throw new Error('Valid network required to upload notification');

		const notification = {
			did: body.did,
			title: body.title,
			subtitle: body.subtitle ?? null,
			message: body.message,
			image: body.image ?? null,
			link: body.link ?? null,
			linkLabel: body.link ? body.linkLabel ?? 'View here' : null,
			type: body.type ?? 'test',
			expireAt: body.expireAt ? new Date(body.expireAt).toISOString().replace('T', ' ').slice(0, -5) : null,
			network: body.network,
			status: 'active',
			createdAt: new Date().toISOString().replace('T', ' ').slice(0, -5),
		};

		if (!upload) return c.json(notification);

		const result = await fetch(
			`https://api.airtable.com/v0/${c.env.AIRTABLE_BASE_ID}/${c.env.AIRTABLE_TABLE_NOTIFICATIONS}`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${c.env.AIRTABLE_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					records: [
						{
							fields: notification,
						},
					],
				}),
			},
		).then((res) => res.json());

		return c.json(result);
	} catch (error) {
		console.error('POST /v1/notifications', error);
		return c.text(error?.message ?? error?.cause ?? error, 500);
	}
};

export const createNotification = async (c) => {
	try {
		const did = c.req.param('did');
		const body: NotificationRequest = await c.req.json();

		if (!did) throw new Error('DID is required to send notifications');
		if (!body.id) throw new Error('Remote ID is required to send notifications');
		if (!body.title) throw new Error('Title is required to send notifications');
		if (!body.message) throw new Error('Message is required to send notifications');
		if (body.expireAt && !new Date(body.expireAt))
			throw new Error('Valid expiration date required to upload notification');
		if (
			body.image &&
			!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(
				body.image,
			)
		)
			throw new Error('Valid image url (https only) required to upload notification');
		if (!['test', 'purchase'].includes(body.type)) throw new Error('Valid type required to upload notification');
		if (!['mainnet', 'testnet', 'devnet'].includes(body.network))
			throw new Error('Valid network required to upload notification');

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
				body.link ? body.linkLabel ?? 'View here' : null,
				body.type,
				body.status,
				body.expireAt ?? null,
				body.version ?? 1,
				body.network,
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
					subtitle: body.subtitle ?? null,
					message: body.message,
					image: body.image ?? null,
					link: body.link ?? null,
					linkLabel: body.link ? body.linkLabel ?? 'View here' : null,
					type: body.type,
					status: body.status,
					expireAt: body.expireAt ?? null,
					version: body.version,
					createdAt: now.toISOString().replace('T', ' ').slice(0, -5),
					network: body.network,
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
		console.error('POST /v1/notifications/:did', error);
		return c.text(error?.message ?? error?.cause ?? error, 500);
	}
};

export const readNotificationReceipts = async (c) => {
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
};

export const updateNotificationAsRead = async (c) => {
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
};

export const updateNotificationStatus = async (c) => {
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
};

export const deleteNotification = async (c) => {
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
};
