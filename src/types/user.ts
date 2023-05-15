export type User = {
	id: number;
	did: string;
	token: string;
	network: 'mainnet' | 'Impact Hub' | 'testnet' | 'Test Zone' | 'devnet' | 'Dev Net';
	status: 'active' | 'inactive';
	version?: string;
	createdAt: string;
	updatedAt: string;
};

export type UserRequest = {
	did: string;
	token: string;
	network: 'mainnet' | 'Impact Hub' | 'testnet' | 'Test Zone' | 'devnet' | 'Dev Net';
	status?: 'active' | 'inactive';
	version?: string;
};

export type UserResponse = {
	id: number;
	did: string;
	token: string;
	network: 'mainnet' | 'Impact Hub' | 'testnet' | 'Test Zone' | 'devnet' | 'Dev Net';
	status: 'active' | 'inactive';
	createdAt: string;
	updatedAt: string;
};
