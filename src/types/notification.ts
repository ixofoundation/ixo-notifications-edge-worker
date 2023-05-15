export type Notification = {
	id: number;
	remoteId: string;
	did: string;
	title: string;
	subtitle?: string;
	message: string;
	image?: string;
	type?: string;
	status: 'active' | 'inactive';
	expireAt?: string;
	version?: number;
	network: string;
	ticket?: string;
	receipt?: string;
	error?: string;
	sentAt?: string;
	createdAt: string;
	updatedAt: string;
};

export type NotificationRequest = {
	id: string;
	did: string;
	title: string;
	subtitle?: string;
	message: string;
	image?: string;
	type: string;
	status?: string;
	expireAt: string;
	version?: number;
};

export type NotificationResponse = {
	id: number;
	did: string;
	title: string;
	subtitle?: string;
	message: string;
	image?: string;
	type?: string;
	status: 'active' | 'inactive';
	expireAt?: string;
	version?: number;
	network: string;
	createdAt: string;
};
