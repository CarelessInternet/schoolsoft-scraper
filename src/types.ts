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

/**
 * Category and news for the news
 */
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

/**
 * Keys for the weekly planning
 */
export interface WeeklyPlanningKeys {
	week: number;
	duration: string;
	content: string;
}

/**
 * Subject and planning for the weekly planning
 */
export interface WeeklyPlanningSubjectAndPlanning {
	subject: string;
	planning: WeeklyPlanningKeys[];
}

/**
 * The weekly planning response type
 */
export interface WeeklyPlanning {
	[index: number]: WeeklyPlanningSubjectAndPlanning;
}
