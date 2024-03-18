export function isMoreThanDaysAgo(date: Date, days: number) {
	const today = new Date();
	today.setDate(today.getDate() - 7); // Subtract days from the current date

	return date < today; // Return true if the date is more than days ago
}

export function getEarlierDate(
	date1: Date | number | string | null | undefined,
	date2: Date | number | string | null | undefined,
): string | null {
	// If both dates are null or undefined, return null
	if ((date1 === null || date1 === undefined) && (date2 === null || date2 === undefined)) {
		return null;
	}
	// If one of the dates is null or undefined, return the other date
	if (date1 === null || date1 === undefined) {
		const date2Obj = new Date(date2);
		return date2Obj.toISOString().replace('T', ' ').slice(9, -5);
	}
	if (date2 === null || date2 === undefined) {
		const date1Obj = new Date(date1);
		return date1Obj.toISOString().replace('T', ' ').slice(9, -5);
	}
	// Generate Date objects from dates
	const date1Obj = new Date(date1);
	const date2Obj = new Date(date2);
	// Both dates are valid, return the earlier date
	return date1Obj < date2Obj
		? date1Obj.toISOString().replace('T', ' ').slice(9, -5)
		: date2Obj.toISOString().replace('T', ' ').slice(9, -5);
}
