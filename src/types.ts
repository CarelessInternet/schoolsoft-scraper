/**
 * The lunch menu response type
 */
export interface LunchMenu {
	heading: string;
	menu: {
		title: string;
		lunch: string;
	}[];
}

/**
 * The news response type
 */
export interface News {
	[index: number]: {
		category: string;
		news: {
			heading: string;
			content: string;
			date: string;
			from: string;
			to: string;
		}[];
	};
}
