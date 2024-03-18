import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

import {
	Notification,
	NotificationTemplate,
	NotificationTemplateRequest,
	NotificationV2Request,
} from '../types/notification';
import { UserResponse } from '../types/user';
import { validateNotificationLink } from '../utils/notification';
import { getEarlierDate, isMoreThanDaysAgo } from '../utils/date';

// [START] notification routes (v2)
export async function getNotificationTemplates(c) {
	try {
		const dump = !!c.req.query('dump');
		const templates = dump
			? await c.env.Notifications.prepare('SELECT * FROM notification_templates').all()
			: await c.env.Notifications.prepare('SELECT * FROM notification_templates WHERE status = ?').bind('active').all();
		return c.json({ success: true, data: (templates?.results ?? []) as NotificationTemplate[] });
	} catch (error) {
		console.error('GET /v2/notifications/templates', error);
		return c.json({ success: false, data: (error as Error).message });
	}
}

export async function getNotificationTemplateById(c) {
	try {
		const id = c.req.param('id');
		if (!id || Number.isNaN(id)) {
			throw new Error('Invalid template id');
		}
		const template = await c.env.Notifications.prepare('SELECT * FROM notification_templates WHERE id = ?')
			.bind(id)
			.first();
		return c.json({ success: true, data: template });
	} catch (error) {
		console.error('GET /2/notifications/templates/:id', error);
		return c.json({ success: false, data: (error as Error).message });
	}
}

export async function saveNotificationTemplate(c) {
	try {
		const body: NotificationTemplateRequest = await c.req.json();
		const { id, networks, title, subtitle, message, image, linkTemplate, linkLabel, type, expireAt, status } =
			body ?? {};
		if (!id || Number.isNaN(id)) {
			return c.json({ success: false, error: `Invalid template ID. Expected type 'number' but got ${typeof id}.` });
		}
		if (
			!networks?.length ||
			!networks.every((network) => network === 'mainnet' || network === 'testnet' || network === 'devnet')
		) {
			return c.json({
				success: false,
				error: `Invalid template networks. Expected ['mainnet' | 'testnet' | 'devnet'] but got ${networks.join(',')}.`,
			});
		}
		if (!title) {
			return c.json({ success: false, error: `Missing template title.` });
		}
		if (!message) {
			return c.json({ success: false, error: `Missing template message.` });
		}
		if (!type) {
			// TODO: validate against types?
			return c.json({ success: false, error: `Missing template type.` });
		}
		// TODO: validate image if provided?
		const existingTemplate = await c.env.Notifications.prepare('SELECT * FROM notification_templates WHERE id = ?')
			.bind(id)
			.first();
		const now = new Date();
		const templateResult = !existingTemplate
			? await c.env.Notifications.prepare(
					'INSERT INTO notification_templates (id, networks, title, subtitle, message, image, linkTemplate, linkLabel, type, expireAt, status, createdAt) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)',
			  )
					.bind(
						id,
						networks.join(','),
						title,
						subtitle ?? null,
						message,
						image ?? null,
						linkTemplate ?? null,
						linkLabel ?? null,
						type,
						expireAt ?? null,
						status ?? 'inactive',
						now.toISOString().replace('T', ' ').slice(0, -5),
					)
					.run()
			: await c.env.Notifications.prepare(
					'UPDATE notification_templates SET networks = ?2, title = ?3, subtitle = ?4, message = ?5, image = ?6, linkTemplate = ?7, linkLabel = ?8, type = ?9, expireAt = ?10, status = ?11 WHERE id = ?1',
			  )
					.bind(
						id,
						networks?.join(','),
						title,
						subtitle ?? null,
						message,
						image ?? null,
						linkTemplate ?? null,
						linkLabel ?? null,
						type,
						expireAt ?? null,
						status ?? 'inactive',
					)
					.run();
		if (!templateResult.success) {
			throw new Error(`Unable to save notification template ${id}`);
		}
		const newTemplate = await c.env.Notifications.prepare('SELECT * FROM notification_templates WHERE id = ?')
			.bind(id)
			.first();
		return c.json({ success: true, data: newTemplate });
	} catch (error) {
		console.error('POST /v2/notifications/templates', error);
		return c.json({ success: false, data: (error as Error).message });
	}
}

export async function getNotifications(c) {
	try {
		const dump = !!c.req.query('dump');
		const network = c.req.query('network');
		const result = dump
			? network && (network === 'mainnet' || network === 'testnet' || network === 'devnet')
				? await c.env.Notifications.prepare('SELECT * FROM notifications_v2 WHERE network = ?').bind(network).all()
				: await c.env.Notifications.prepare('SELECT * FROM notifications_v2').all()
			: network && (network === 'mainnet' || network === 'testnet' || network === 'devnet')
			? await c.env.Notifications.prepare('SELECT * FROM notifications_v2 WHERE status = ?1 and network = ?2')
					.bind('active', network)
					.all()
			: await c.env.Notifications.prepare('SELECT * FROM notifications_v2 WHERE status = ?').bind('active').all();
		return c.json({ success: true, data: result?.results });
	} catch (error) {
		console.error('GET /v2/notifications', error);
		return c.json({ success: false, data: (error as Error).message });
	}
}

export async function getNotificationById(c) {
	try {
		const id = c.req.param('id');
		const result = await c.env.Notifications.prepare(
			'SELECT N.id AS id, T.title AS title, T.message AS message, N.status AS status, N.createdAt AS createdAt, N.expireAt AS expireAt, U.did AS did, T.type AS type, U.network AS network FROM notifications_v2 AS N INNER JOIN notification_templates AS T ON N.template = T.id INNER JOIN users AS U ON N.user = U.id WHERE N.id = ?',
		)
			.bind(id)
			.first();
		return c.json({ success: true, data: result });
	} catch (error) {
		console.error('GET /v2/notifications/id/:id', error);
		return c.json({ success: false, data: (error as Error).message });
	}
}

export async function getNotificationByNetworkAndDid(c) {
	try {
		const network = c.req.param('network');
		const did = c.req.param('did');
		const date = c.req.query('date');
		const dump = !!c.req.query('dump');
		const dateObj = date ? new Date(date) : new Date();
		const expireAt = dateObj.toISOString().replace('T', ' ').slice(0, -5);
		const result = dump
			? await c.env.Notifications.prepare(
					'SELECT N.id AS id, T.title AS title, T.message AS message, N.status AS status, N.createdAt AS createdAt, N.expireAt AS expireAt, U.did AS did, T.type AS type, U.network AS network FROM notifications_v2 AS N INNER JOIN notification_templates AS T ON N.template = T.id INNER JOIN users AS U ON N.user = U.id WHERE U.did = ?1 AND U.network = ?2 AND  (N.expireAt IS NULL OR N.expireAt >= ?3)',
			  )
					.bind(did, network, expireAt)
					.all()
			: await c.env.Notifications.prepare(
					'SELECT N.id AS id, T.title AS title, T.message AS message, N.status AS status, N.createdAt AS createdAt, N.expireAt AS expireAt, U.did AS did, T.type AS type, U.network AS network FROM notifications_v2 AS N INNER JOIN notification_templates AS T ON N.template = T.id INNER JOIN users AS U ON N.user = U.id WHERE U.did = ?1 AND U.network = ?2 AND N.status = ?3 AND (N.expireAt IS NULL OR N.expireAt >= ?4)',
			  )
					.bind(did, network, 'active', expireAt)
					.all();
		return c.json({ success: true, data: result?.results ?? [] });
	} catch (error) {
		console.error('GET /v2/notifications/:network/:did', error);
		return c.json({ success: false, data: (error as Error).message });
	}
}

export async function saveNotification(c) {
	try {
		// TODO: ensure to get the latest account with the push token and only send to that account
		// get params data
		const network = c.req.param('network');
		const did = c.req.param('did');
		// fetch user
		const user: UserResponse = await c.env.Notifications.prepare(
			'SELECT * FROM users WHERE did = ?1 AND network = ?3 ORDER BY updatedAt DESC, createdAt DESC',
		)
			.bind(did, 'active', network)
			.first();
		// validate user
		if (!user) {
			throw new Error(`User with did '${did}' ('${network}') not found`);
		}
		if (user.status !== 'active') {
			throw new Error('Notification recipient not active.');
		}
		// get body data
		const body: NotificationV2Request = await c.req.json();
		const { id, template, link, expireAt, status } = body ?? {};
		// validate body data
		if (!id) {
			throw new Error(`Invalid ID. Expected type 'number' but got ${typeof id}`);
		}
		if (!template) {
			throw new Error('Invalid template ID.');
		}
		if (link && typeof link !== 'string') {
			throw new Error(`Invalid link. Expected type 'number' but got ${typeof link}`);
		}
		// fetch notification template
		const notificationTemplate: NotificationTemplate | undefined = await c.env.Notifications.prepare(
			'SELECT * FROM notification_templates WHERE id = ?1',
		)
			.bind(template)
			.first();
		// validate notification template
		if (!notificationTemplate?.id) {
			throw new Error(`Template with ID '${template}' not found.`);
		}
		if (notificationTemplate.status !== 'active') {
			throw new Error(`Template with ID '${template}' not active.`);
		}
		if (!(notificationTemplate?.networks ?? [])?.includes(network)) {
			throw new Error(`Template with ID '${template}' not available for ${network}.`);
		}
		if (link && !notificationTemplate.linkTemplate) {
			throw new Error(`Notification template does not allow link '${link}'`);
		}
		if (link && notificationTemplate.linkTemplate) {
			const notificationLinkValid = validateNotificationLink(link, notificationTemplate.linkTemplate);
			if (!notificationLinkValid) {
				throw new Error(
					`Invalid notification link. Expected notification link to match ${notificationTemplate.linkTemplate}`,
				);
			}
		}
		// check if existing notification
		const existingNotification = await c.env.Notifications.prepare('SELECT * FROM notifications_v2 WHERE id = ?')
			.bind(id)
			.first();
		if (existingNotification?.id) {
			if (existingNotification.ticket) {
				throw new Error(`Notification already sent - ticket '${existingNotification.ticket}'`);
			}
			if (existingNotification.user !== user.id) {
				throw new Error(`Notification exists for different user - not ${did} (${network})`);
			}
		}
		// generate notification data
		const userTokenIsOld = isMoreThanDaysAgo(new Date(user.updatedAt), 7); // 7 days ago for now
		const now = new Date();
		const notificationExpireAt = getEarlierDate(expireAt, notificationTemplate.expireAt);
		const expireAtDate = new Date(notificationExpireAt);
		const notificationStatus =
			existingNotification?.status === 'draft' && status === 'active' && (!expireAtDate || expireAtDate > new Date())
				? status
				: expireAtDate && expireAtDate < new Date()
				? 'expired'
				: status === 'active' && userTokenIsOld
				? 'draft'
				: status;
		const notificationResult = existingNotification?.id
			? await c.env.Notifications.prepare(
					'UPDATE notifications_v2 SET template = ?2, link = ?3, expireAt = ?4, status = ?5 WHERE id = ?1',
			  ).bind(id, template, link, notificationExpireAt, notificationStatus)
			: await c.env.Notifications.prepare(
					'INSERT INTO notifications_v2 (id, template, user, link, expireAt, status, createdAt) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
			  )
					.bind(
						id,
						template,
						user.id,
						link ?? null,
						notificationExpireAt,
						notificationStatus,
						now.toISOString().replace('T', ' ').slice(9, -5),
					)
					.run();
		// validate notification data
		if (!notificationResult.success) {
			throw new Error('Failed to save notification.');
		}
		if (notificationStatus === 'expired') {
			throw new Error('Cannot send expired notification.');
		}
		if (notificationStatus !== 'active') {
			throw new Error(`Cannot send '${notificationStatus}' notification.`);
		}
		// prep expo
		const expo = new Expo();
		if (!Expo.isExpoPushToken(user.token)) {
			throw new Error(`Push token ${user.token} is not a valid Expo push token`);
		}
		const message: ExpoPushMessage = {
			to: user.token,
			sound: 'default',
			title: notificationTemplate.title,
			body: notificationTemplate.message,
			data: {
				id: id,
				type: notificationTemplate.type,
				expire: notificationExpireAt,
				did: did,
				network: network,
			},
		};
		if (notificationExpireAt) {
			message.expiration = Math.ceil(new Date(notificationExpireAt).getTime() ?? 0);
		}
		// send notification
		const [chunk] = expo.chunkPushNotifications([message]);
		const [ticket]: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);
		const result =
			ticket.status === 'ok'
				? await c.env.Notifications.prepare('UPDATE notifications_v2 SET ticket = ?1 WHERE id = ?2')
						.bind(ticket.id, id)
						.run()
				: await c.env.Notifications.prepare('UPDATE notifications_v2 SET error = ?1 WHERE id = ?2')
						.bind(ticket.details.error, id)
						.run();
		// respond
		return c.json({ success: result?.success, data: ticket });
	} catch (error) {
		console.error('POST /v2/notifications', error);
		return c.json({ success: false, data: (error as Error).message });
	}
}

export async function fetchNotificationReceipts(c) {
	try {
		const result = await c.env.Notifications.prepare(
			'SELECT * FROM notifications_v2 WHERE ticket IS NOT NULL AND receipt IS NULL',
		).all();

		if (!result.results?.length) return c.json({ success: false, data: [] });

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
						await c.env.Notifications.prepare('UPDATE notifications_v2 SET receipt = ?1 WHERE id = ?2')
							.bind(status, notificationId)
							.run();
					} else {
						if (details?.error) {
							await c.env.Notifications.prepare('UPDATE notifications_v2 SET receipt = ?1, error = ?2 WHERE id = ?3')
								.bind(status, details.error ?? '', notificationId)
								.run();
						}
					}
				}
			} catch (error) {
				console.error(error);
			}
		}

		const notificationIds = result.results.map((r: Notification) => r.id);
		const receiptResult = await c.env.Notifications.prepare(
			`SELECT * FROM notifications_v2 WHERE id IN (${notificationIds.join(', ')})`,
		).all();
		return c.json({ success: true, data: receiptResult.results });
	} catch (error) {
		console.error('GET /v2/notifications/receipts', error);
		return c.json({ success: false, data: (error as Error).message });
	}
}

export async function updateNotificationStatusById(c) {
	try {
		const id = c.req.param('id');
		const body: { status: string } = await c.req.json();
		const result = await c.env.Notifications.prepare(
			'UPDATE notifications_v2 SET status = ?1 WHERE id = ?2 AND ticket IS NULL',
		)
			.bind(body.status, Number(id ?? 0))
			.all();
		const notification = await c.env.Notifications.prepare('SELECT * FROM notifications_v2 WHERE id = ?')
			.bind(id)
			.first();
		return c.json({ success: true, data: notification });
	} catch (error) {
		return c.json({ success: false, data: (error as Error).message });
	}
}

export async function deleteNotification(c) {
	try {
		const id = c.req.param('deleteId');
		const result = await c.env.Notifications.prepare(
			'UPDATE notifications_v2 SET status = ?2 WHERE id = ?1 AND status != ?2',
		)
			.bind(Number(id ?? 0), 'deleted')
			.all();
		const notification = await c.env.Notifications.prepare('SELECT * FROM notifications_v2 WHERE id = ?')
			.bind(id)
			.first();
		return c.json({ success: true, data: notification });
	} catch (error) {
		return c.json({ success: false, data: (error as Error).message });
	}
}
