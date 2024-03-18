export function validateNotificationLink(link: string, linkTemplate: string): boolean {
	// check if template is '*' wildcard that allows anything
	if (linkTemplate === '*') {
		return true;
	}
	// escape special regex characters
	let templateRegex = linkTemplate.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
	// replace template variable with regex pattern to match any valid segment
	templateRegex = templateRegex.replace(/{{[^{}]*}}/g, '([^/]+)');
	// replace wildcard * with regex pattern to match any sequence of characters
	templateRegex = templateRegex.replace(/\*/g, '.*');
	// create regex to represent entire template
	const regex = new RegExp(`^${templateRegex}$`);
	// test the link against the regex
	return regex.test(link);
}
