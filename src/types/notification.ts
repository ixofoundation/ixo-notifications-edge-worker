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

export type NotificationV2Request = {
	id: number;
	template: number;
	link?: string;
	expireAt?: string;
	status: string;
};

export type NotificationTemplate = {
	id: number;
	networks: Array<'mainnet' | 'testnet' | 'devnet'>;
	title: string;
	subtitle?: string;
	message?: string;
	image?: string; // url
	linkTemplate?: string;
	linkLabel?: string; // max length
	type: 'feedback' | 'purchase' | 'test';
	expireAt?: string; // ISO 8601
	status: 'active' | 'expired' | 'inactive' | 'draft';
	createdAt: string;
};

export type NotificationTemplateRequest = {
	id: number;
	networks: Array<'mainnet' | 'testnet' | 'devnet'>;
	title: string;
	subtitle?: string;
	message: string;
	image?: string;
	linkTemplate?: string;
	linkLabel?: string;
	type?: string;
	expireAt?: string;
	status?: string;
};

export type NotificationV2 = {
	id: number;
	template: number;
	user: number;
	link?: string;
	expireAt?: string;
	status: string;
	createdAt: string;
	ticket?: string;
	receipt?: string;
	error?: string;
};
