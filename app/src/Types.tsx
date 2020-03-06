import {Changes} from "./Enums";

export interface IMethodTransport {
	longName: string;
	startLine: number;
	methodName: string;
	isStatic: boolean;
	isAbstract: boolean;
	visibility: "public" | "private" | "protected" | "";
}

export interface IHistoryTransport {
	[sha: string]: ICommit
}

export interface IChange {
	type: string;
	commitMessage: string;
	commitDate: string; // new Date('2015-07-24, 9:38 AM') or Date.parse('2015-07-24, 9:38 AM') for just a number
	commitName: string;
	commitAuthor: string;
	commitDateOld?: string,
	commitNameOld?: string;
	commitAuthorOld?: string;
	daysBetweenCommits?: number;
	commitsBetweenForRepo?: number;
	commitsBetweenForFile?: number;
	diff?: string;
	extendedDetails?: any;
}

export interface ICommit extends IChange {
	subchanges?: IChange[];
}

export interface ICommitx extends ICommit{
	file?: string;
}

export interface IManifest {
	[file: string]: IManifestEntry;
}

export interface IManifestEntry {
	repoShort: string;
	sha: string;
	repo: string;
	filePath: string;
	historyShort: Changes[];
	method: IMethodTransport;
}

export class ServerBusyError extends Error {
	constructor(...args: any[]) {
		super(...args);
		Error.captureStackTrace(this, ServerBusyError);
	}
}

export class ParseCachedError extends Error {
	constructor(...args: any[]) {
		super(...args);
		Error.captureStackTrace(this, ServerBusyError);
	}
}

export class InternalError extends Error {
	constructor(...args: any[]) {
		super(...args);
		Error.captureStackTrace(this, InternalError);
	}
}

export class EmptyError extends Error {
	constructor(...args: any[]) {
		super(...args);
		Error.captureStackTrace(this, InternalError);
	}
}
