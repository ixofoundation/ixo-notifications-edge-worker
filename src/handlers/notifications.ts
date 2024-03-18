export async function getNotifications(c) {
	try {
		const dump = !!c.req.query('dump');
		const result = dump
			? await c.env.Notifications.prepare('SELECT * FROM notifications').all()
			: await c.env.Notifications.prepare('SELECT * FROM notifications WHERE status = ?').bind('active').all();
		return c.json(result?.results);
	} catch (error) {
		console.error('GET /v1/notifications', error);
		return c.text(error, 500);
	}
}

export async function getNotificationsByDid(c) {
	try {
		const did = c.req.param('did');
		const date = c.req.query('date');
		const dump = !!c.req.query('dump');
		const dateObj = date ? new Date(date) : new Date();
		const expireAt = dateObj.toISOString().replace('T', ' ').slice(0, -5);
		const result = dump
			? await c.env.Notifications.prepare('SELECT * FROM notifications WHERE did = ?1').bind(did).all()
			: await c.env.Notifications.prepare(
					'SELECT * FROM notifications WHERE did = ?1 AND expireAt >= ?2 AND status = ?3',
			  )
					.bind(did, expireAt, 'active')
					.all();
		return c.json(result?.results ?? []);
	} catch (error) {
		console.error('GET /v1/notifications/did/:did', error);
		return c.text(error, 500);
	}
}

export async function getNotificationById(c) {
	try {
		const id = c.req.param('id');
		const result = await c.env.Notifications.prepare('SELECT * FROM notifications WHERE id = ?').bind(id).first();
		return c.json(result);
	} catch (error) {
		console.error('GET /v1/notifications/:id', error);
		return c.text(error, 500);
	}
}

export async function saveNotification(c) {
	try {
		throw new Error('Endpoint deprecated - use v2.');
	} catch (error) {
		console.error('POST /v1/notifications', error);
		return c.text(error, 500);
	}
}

export async function fetchNotificationReceipts(c) {
	try {
		throw new Error('Endpoint deprecated - use v2.');
	} catch (error) {
		console.error('GET /v1/notifications/receipts', error);
		return c.text(error, 500);
	}
}

export async function updateNotificationStatus(c) {
	try {
		throw new Error('Endpoint deprecated - use v2.');
	} catch (error) {
		return c.text(error, 500);
	}
}

export async function deleteNotification(c) {
	try {
		throw new Error('Endpoint deprecated - use v2.');
	} catch (error) {
		return c.text(error, 500);
	}
}
