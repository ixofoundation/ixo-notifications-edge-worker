export function chunkArray<T>(arr: T[], chunkSize: number): T[][] | null {
	try {
		if (!Array.isArray(arr)) throw new Error('Input is not an array.');

		if (chunkSize <= 0) throw new Error('Chunk size must be greater than 0.');

		const chunkedArray: T[][] = [];
		for (let i = 0; i < arr.length; i += chunkSize) {
			chunkedArray.push(arr.slice(i, i + chunkSize));
		}

		return chunkedArray;
	} catch (error) {
		console.error('chunkArray::', error);
		return [];
	}
}

export async function uploadChunksAsync<T>(
	arr: T[],
	chunkSize: number,
	uploadFunction: (chunk: T[]) => Promise<any>,
): Promise<T[]> {
	const chunkedArray: T[][] = chunkArray<T>(arr, chunkSize);

	if (!chunkedArray) throw new Error('chunkedArray is null');

	const uploadedChunks: T[][] = [];
	for (const chunk of chunkedArray) {
		const uploadedChunk = await uploadFunction(chunk);
		uploadedChunks.push(uploadedChunk);
	}

	// Flatten the uploadedChunks array
	const flattenedUploadedChunks = uploadedChunks.reduce((acc, val) => acc.concat(val), []);

	return flattenedUploadedChunks;
}
