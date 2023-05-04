export type Notification = {
	id: number;
	title: string;
	message: string;
	status: string;
	createdAt: string;
	expireAt: string;
	did: string;
	type: string;
	ticket?: string;
	receipt?: string;
	error?: string;
};

export type NotificationRequest = {
	title: string;
	message: string;
	status: string;
	createdAt: string;
	expireAt: string;
	did: string;
	type: string;
};

export type NotificationResponse = {
	id: number;
	title: string;
	message: string;
	status: string;
	createdAt: string;
	expireAt: string;
	did: string;
	type: string;
	ticket?: string;
	receipt?: string;
	error?: string;
};
