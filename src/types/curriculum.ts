import { CurriculumResourceType } from "@prisma/client";

export type NodeType = 'CHAPTER' | 'TOPIC' | 'SUBTOPIC';
export type ActivityType = 
	| 'QUIZ_MULTIPLE_CHOICE'
	| 'QUIZ_DRAG_DROP'
	| 'QUIZ_FILL_BLANKS'
	| 'QUIZ_MEMORY'
	| 'QUIZ_TRUE_FALSE'
	| 'GAME_WORD_SEARCH'
	| 'GAME_CROSSWORD'
	| 'GAME_FLASHCARDS'
	| 'VIDEO_YOUTUBE'
	| 'READING'
	| 'CLASS_ASSIGNMENT'
	| 'CLASS_PROJECT'
	| 'CLASS_PRESENTATION'
	| 'CLASS_TEST'
	| 'CLASS_EXAM';

export interface FileInfo {
	name: string;
	size: number;
	type: string;
	url?: string;
}

export interface QuizContent {
	questions: {
		question: string;
		options?: string[];
		correctAnswer?: string | number;
		points?: number;
	}[];
}

export interface AssignmentContent {
	instructions: string;
	dueDate?: Date;
	totalPoints?: number;
	rubric?: {
		criteria: string;
		points: number;
	}[];
}

export interface DiscussionContent {
	topic: string;
	guidelines?: string[];
	dueDate?: Date;
	minResponses?: number;
}

export interface ProjectContent {
	description: string;
	objectives?: string[];
	dueDate?: Date;
	deliverables?: string[];
	rubric?: {
		criteria: string;
		points: number;
	}[];
}

export interface ReadingContent {
    content: string;  // Novel editor content
    estimatedReadingTime?: number;
    references?: string[];
}

export type ActivityContent = 
	| QuizContent 
	| AssignmentContent 
	| DiscussionContent 
	| ProjectContent
	| ReadingContent;

export interface CurriculumNode {
	id: string;
	title: string;
	description?: string;
	type: NodeType;
	parentId?: string;
	order: number;
	subjectId: string;
	resources: CurriculumResource[];
	activities: CurriculumActivity[];
	children?: CurriculumNode[];
	createdAt: Date;
	updatedAt: Date;
}

export interface CurriculumResource {
	id: string;
	title: string;
	type: CurriculumResourceType;
	content: string;
	nodeId: string;
	fileInfo?: FileInfo;
	createdAt: Date;
	updatedAt: Date;
}

export interface CurriculumActivity {
	id: string;
	title: string;
	type: ActivityType;
	content: ActivityContent;
	isGraded: boolean;
	nodeId: string;
	createdAt: Date;
	updatedAt: Date;
}