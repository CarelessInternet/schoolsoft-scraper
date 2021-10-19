// im so bad at naming interfaces and literally anything

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
 * Keys for the News Interface
 */
export interface NewsKeys {
	heading: string;
	content: string;
	date: string;
	from: string;
	to: string;
}

export interface NewsCategoryAndNews {
	category: string;
	news: NewsKeys[];
}

/**
 * The news response type
 */
export interface News {
	[index: number]: NewsCategoryAndNews;
}

/**
 * Keys for the Assignments interface
 */
export interface AssignmentKeys {
	heading: string;
	content: string;
	date: string;
	lesson: string;
	teacher: string;
	type: string;
	id: number;
}

/**
 * The assignments response type, ID of the assignment is included
 */
export interface Assignments {
	upcoming: AssignmentKeys[];
	old: AssignmentKeys[];
}

/**
 * Keys for the Results interface
 */
export interface ResultKeys {
	heading: string;
	comment: string;
	description: string;
	date: string;
	lesson: string;
	teacher: string;
	type: string;
	id: number;
}

/**
 * The results response type, ID of the assignment is included
 */
export interface Results {
	new: ResultKeys[];
	old: ResultKeys[];
}
