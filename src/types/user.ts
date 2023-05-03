export type User = {
	did: string;
	token: string;
	network: 'mainnet' | 'testnet' | 'devnet';
};

export type UserRequest = {
	did: string;
	token: string;
	network: 'mainnet' | 'testnet' | 'devnet';
	// os?: string;
	// device?: string;
};

export type UserResponse = {
	id: number;
	did: string;
	token: string;
	network: 'mainnet' | 'testnet' | 'devnet';
	// os?: string;
	// device?: string;
	updatedAt: string;
};
