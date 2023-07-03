export type Notification = {
	id: number;
	remoteId: string;
	did: string;
	title: string;
	subtitle?: string;
	message: string;
	image?: string;
	link?: string;
	linkLabel?: string;
	type?: string;
	status: 'active' | 'inactive';
	expireAt?: string;
	version?: number;
	network: string;
	read: boolean;
	ticket?: string;
	receipt?: string;
	error?: string;
	sentAt?: string;
	createdAt: string;
	updatedAt: string;
};

export type NotificationUploadRequest = {
	did: string;
	title: string;
	subtitle?: string;
	message: string;
	image?: string;
	link?: string;
	linkLabel?: string;
	type: string;
	expireAt?: string;
	network: 'mainnet' | 'testnet' | 'devnet';
	status: 'active' | 'inactive';
	createdAt?: string;
};

export type PurchaseNotificationUploadRequest = {
	did: string;
	title?: string;
	subtitle?: string;
	message?: string;
	image?: string;
	linkLabel?: string;
	expireAt?: string;
	network: 'mainnet' | 'testnet' | 'devnet';
	collection: string;
};

export type NotificationRequest = {
	id: string;
	did: string;
	title: string;
	subtitle?: string;
	message: string;
	image?: string;
	link?: string;
	linkLabel?: string;
	type: string;
	status?: string;
	expireAt: string;
	version?: number;
	network: 'mainnet' | 'testnet' | 'devnet';
};

export type NotificationResponse = {
	id: number;
	did: string;
	title: string;
	subtitle?: string;
	message: string;
	image?: string;
	link?: string;
	linkLabel?: string;
	type?: string;
	status: 'active' | 'inactive';
	expireAt?: string;
	version?: number;
	network: string;
	read: boolean;
	createdAt: string;
};
