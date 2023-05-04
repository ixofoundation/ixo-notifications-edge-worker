export type User = {
	did: string;
	token: string;
	network: 'mainnet' | 'testnet' | 'devnet';
	status: 'active' | 'inactive';
};

export type UserRequest = {
	did: string;
	token: string;
	network: 'mainnet' | 'testnet' | 'devnet';
	status?: 'active' | 'inactive';
	// os?: string;
	// device?: string;
};

export type UserResponse = {
	id: number;
	did: string;
	token: string;
	network: 'mainnet' | 'testnet' | 'devnet';
	status: 'active' | 'inactive';
	// os?: string;
	// device?: string;
	updatedAt: string;
};
